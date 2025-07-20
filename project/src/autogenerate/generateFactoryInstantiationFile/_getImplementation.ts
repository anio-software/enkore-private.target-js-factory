import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {MyTSFunctionDeclaration} from "@anio-software/enkore-private.target-js-toolchain_types"
import type {Options} from "./Options.ts"
import {getToolchain} from "#~src/getToolchain.ts"
import {assertStripPrefix} from "@anio-software/pkg.js-utils"

type Dependency = {
	key: string
	moduleSpecifier: string
	modulePropertyName: string
}

type Ret = {
	implementation: MyTSFunctionDeclaration
	overloads: MyTSFunctionDeclaration[]
	dependencies: Dependency[]
}

function getMyTSModuleFromFilePath(
	session: EnkoreSessionAPI,
	filePath: string
) {
	const toolchain = getToolchain(session)

	const {program} = toolchain.tsCreateProgram(
		session.project.root, [
			filePath
		], toolchain.tsReadTSConfigFile(
			session.project.root, "tsconfig/base.json"
		).compilerOptions
	)

	return program.getModule(filePath)
}

export function _getImplementation(
	session: EnkoreSessionAPI,
	filePath: string,
	implementationFunctionName: string
): Ret {
	const toolchain = getToolchain(session)
	const dependencies: Dependency[] = []

	// we've established that filePath (options.source) **must** start with project/
	// see checkOptions.ts

	// we need to use the pre-processed version of the input source file
	// this is because tsCreateProgram() isn't configured to resolve
	// the import aliases #~src, #~export etc.
	// this is also why "generateAfterPreprocessing" is set to 'true'
	const buildPath = `build/${assertStripPrefix(filePath, "project/")}`
	const mod = getMyTSModuleFromFilePath(session, buildPath)!

	if (!mod.moduleExports.has(implementationFunctionName)) {
		throw new Error(
			`expected '${filePath}' to export a symbol named '${implementationFunctionName}'.`
		)
	}

	const implementationExport = mod.moduleExports.get(implementationFunctionName)!

	if (implementationExport.kind !== "function") {
		throw new Error(
			`exported symbol '${implementationFunctionName}' must be a function.`
		)
	}

	if (!implementationExport.declarations.length) {
		throw new Error(`Unknown error: declarations is empty.`)
	}

	const {declarations} = implementationExport
	// last declaration is always the implementation
	const implementation = declarations[declarations.length - 1]

	if (!implementation.parameters.length) {
		throw new Error(`implementation must take at least two parameters.`)
	}

	if (implementation.parameters[0].type !== "EnkoreJSRuntimeFunctionThis") {
		throw new Error(`first parameter must be of literal type 'EnkoreJSRuntimeFunctionThis'.`)
	} else if (implementation.parameters[0].name !== "this") {
		throw new Error(`first parameter must be named 'this'.`)
	} else if (implementation.parameters[1].type !== "EnkoreJSRuntimeContextOptions") {
		throw new Error(`first parameter must be of literal type 'EnkoreJSRuntimeContextOptions'.`)
	}

	// todo: cross check overloads?

	const deps = mod.getModuleExportByName("__EnkoreFunctionDependencies", true)

	if (deps && deps.kind === "type") {
		const members = toolchain._tsGetTypeAliasTypeQueryMembers(
			deps.declaration
		)

		for (const member of members) {
			// todo: add log statements
			if (!member.origin) continue
			if (!member.origin.startsWith(`${session.project.root}/`)) continue

			const relativeOrigin = member.origin.slice(`${session.project.root}/`.length)
			const originModule = (() => {
				if (relativeOrigin === buildPath) {
					return mod
				}

				return getMyTSModuleFromFilePath(session, relativeOrigin)
			})()

			if (!originModule) continue
			if (!originModule.moduleImports.has(member.expression)) continue

			const importDecl = originModule.moduleImports.get(member.expression)!

			if (importDecl.kind !== "named") continue

			// this ensures the user doesn't accidentally use the
			// function from the module directly.
			if (!importDecl.isTypeOnly) {
				throw new Error(
					`dependency '${importDecl.moduleSpecifier}' must be import using a type-only import.`
				)
			}

			dependencies.push({
				key: member.property,
				moduleSpecifier: importDecl.moduleSpecifier,
				modulePropertyName: importDecl.members[0].propertyName
			})
		}
	}

	return {
		implementation,
		overloads: declarations.slice(
			0,
			declarations.length -1
		),
		// sort for stable code output
		dependencies: dependencies.toSorted((a, b) => {
			let aStr = `${a.key},${a.modulePropertyName},${a.moduleSpecifier}`
			let bStr = `${b.key},${b.modulePropertyName},${b.moduleSpecifier}`

			return aStr.localeCompare(bStr, "en")
		})
	}
}
