import {type EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {AutogenerateAPIContext} from "#~src/autogenerate/AutogenerateAPIContext.ts"
import type {Options} from "./Options.ts"
import type {Variant} from "./Variant.ts"
import type {MyTSFunctionDeclaration} from "@anio-software/enkore-private.target-js-toolchain_types"
import {_getImplementation} from "./_getImplementation.ts"
import {generateNeededTypeDeclarations} from "./generateNeededTypeDeclarations.ts"
import {getBaseModuleSpecifier} from "#~src/getBaseModuleSpecifier.ts"
import {getToolchain} from "#~src/getToolchain.ts"

function convertPath(path: string) {
	if (path.startsWith("project/src")) {
		return `#~src` + path.slice("project/src".length)
	} else if (path.startsWith("project/export")) {
		return `#~export` + path.slice("project/export".length)
	}

	return path
}

export function _generateFactoryCode(
	apiContext: AutogenerateAPIContext,
	session: EnkoreSessionAPI,
	options: Options,
	exportName: string,
	variant: Variant
) {
	const toolchain = getToolchain(session)

	const implementationFunctionName = (
		variant === "syncVariant"
	) ? "__implementationSync" : "__implementation"

	const {implementation, overloads, dependencies} = _getImplementation(
		session, options, implementationFunctionName
	)

	const hasDependencies = implementation.parameters[1]?.type === "__EnkoreFunctionDependencies"

	let code = ``

	code += `import {${implementation.name}} from "${convertPath(options.source)}"\n`
	// make sure global symbols are namespaced to not collide with user symbols
	code += `import {createContext as enkoreJSRuntimeCreateContext} from "@anio-software/enkore.js-runtime"\n`
	code += `import type {EnkoreJSRuntimeContext} from "@anio-software/enkore.js-runtime"\n`
	code += `import {getProject as enkoreGetProject} from "${getBaseModuleSpecifier(apiContext.target)}/project"\n`
	code += `\n`
	code += `// vvv--- types needed for implementation\n`
	code += generateNeededTypeDeclarations(apiContext, session, implementation)
	code += `// ^^^--- types needed for implementation\n`
	code += `\n`

	if (hasDependencies) {
		code += `// vvv--- factories needed for implementation\n`

		for (const [i, dependency] of dependencies.entries()) {
			code += `import {${dependency.modulePropertyName}Factory as __enkoreDep${i}} from "${dependency.moduleSpecifier}"\n`
		}

		code += `// ^^^--- factories needed for implementation\n`
		code += `\n`
	}

	if (!overloads.length) {
		code += functionDeclarationToString(implementation)
	} else {
		for (const overload of overloads) {
			code += functionDeclarationToString(overload)
		}
	}

	code += `\n`
	code += `export function ${exportName}Factory(\n`
	code += `\tcontextOptions: EnkoreJSRuntimeContextOptions\n`
	code += `): typeof __enkoreUserFunction {\n`

	if (hasDependencies) {
		code += `\tconst dependencies: __EnkoreFunctionDependencies = `

		code += (() => {
			if (!dependencies.length) return `{}`

			let tmp = `{\n`

			const castToAny = options.__forceCompatibility === true ? " as any" : ""

			for (const [i, dependency] of dependencies.entries()) {
				tmp += `\t\t${dependency.key}: __enkoreDep${i}(contextOptions${castToAny}),\n`
			}

			tmp = tmp.slice(0, -2)

			return `${tmp}\n\t}`
		})()

		code += `\n`
	}

	code += `\n`
	code += `\tconst localContextOptions: EnkoreJSRuntimeContextOptions = {...contextOptions}\n`

	code += `\tconst currentPackageJSON = enkoreGetProject().packageJSON;\n`
	code += `\tconst originatingPackage = {\n`
	code += `\t\tname: currentPackageJSON.name,\n`
	code += `\t\tversion: currentPackageJSON.version,\n`
	code += `\t\tauthor: currentPackageJSON.author,\n`
	code += `\t\tlicense: currentPackageJSON.license\n`
	code += `\t}\n\n`

	code += `\tif (localContextOptions.entityMajorVersion === 0) {\n`
	//code += `\tif (localContext.entityMajorVersion === 0\n`
	//code += `\t    localContext.entityMajorVersion === 1) {\n`
	code += `\t\tlocalContextOptions.__internalDoNotUse = {\n`
	code += `\t\t\toriginatingPackage,\n`
	code += `\t\t\toriginatingFunction: undefined\n`
	code += `\t\t};\n`
	code += `\t}\n`
	code += `\n`

	code += `\tconst fn: any = ${asyncStr("async ")}function ${exportName}(...args: any[]) {\n`
	code += `\t\tlet lastCreatedContext: EnkoreJSRuntimeContext|null = null\n\n`
	code += `\t\tconst thisObject: EnkoreJSRuntimeFunctionThis = {\n`
	code += `\t\t\tentityKind: "EnkoreJSRuntimeFunctionThis",\n`
	code += `\t\t\tentityMajorVersion: 0,\n`
	code += `\t\t\tentityRevision: 0,\n`
	code += `\t\t\tentityCreatedBy: null,\n`
	code += `\t\t\tcreateContext(options, majorVersion, functionName?) {\n`
	code += `\t\t\t\tconst newOptions = {...options}\n\n`
	code += `\t\t\t\tnewOptions.__internalDoNotUse = {\n`
	code += `\t\t\t\t\toriginatingPackage,\n`
	code += `\t\t\t\t\toriginatingFunction: functionName !== undefined ? {name: functionName} : undefined\n`
	code += `\t\t\t\t}\n\n`
	code += `\t\t\t\tconst ctx = enkoreJSRuntimeCreateContext(newOptions, majorVersion)\n\n`
	code += `\t\t\t\tlastCreatedContext = ctx\n\n`
	code += `\t\t\t\treturn ctx\n`
	code += `\t\t\t}\n`
	code += `\t\t}\n\n`
	code += `\t\ttry {\n`
	code += `\t\t\t// @ts-ignore:next-line\n`
	code += `\t\t\treturn ${asyncStr("await ")}${implementation.name}.call(thisObject, localContextOptions, ${hasDependencies ? "dependencies, " : ""}...args);\n`
	code += `\t\t} catch (e: unknown) {\n`
	code += `\t\t\t// log error on last created context object\n`
	code += `\t\t\tif (lastCreatedContext) {\n`
	code += `\t\t\t\t(lastCreatedContext as EnkoreJSRuntimeContext).logException(e);\n`
	code += `\t\t\t}\n\n`
	code += `\t\t\tthrow e;\n`
	code += `\t\t}\n`
	code += `\t}\n`

	code += `\n`
	code += `\treturn fn;\n`

	code += `}\n`

	return code

	function functionDeclarationToString(decl: MyTSFunctionDeclaration) {
		let tmp = ``

		tmp += decl.jsDoc
		tmp += (decl.jsDoc.length ? "\n" : "")
		tmp += toolchain.tsConvertTSFunctionDeclarationToString({
			...decl,
			parameters: decl.parameters.slice(hasDependencies ? 3 : 2)
		}, {
			overwriteFunctionName: "__enkoreUserFunction"
		}) + "\n"

		return tmp
	}

	function asyncStr(str: string): string {
		if (variant !== "asyncVariant") {
			return ""
		}

		return str
	}
}
