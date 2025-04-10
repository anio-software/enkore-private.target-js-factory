import {type EnkoreSessionAPI} from "@enkore/spec"
import type {AutogenerateAPIContext} from "#~src/autogenerate/AutogenerateAPIContext.mts"
import type {Options} from "./Options.mts"
import type {Variant} from "./Variant.mts"
import type {MyTSFunctionDeclaration} from "@enkore-types/typescript"
import {_getImplementation} from "./_getImplementation.mts"
import {generateNeededTypeDeclarations} from "./generateNeededTypeDeclarations.mts"
import {getTargetDependency} from "#~src/targetIntegration/getTargetDependency.mts"

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
	const nodeMyTS = getTargetDependency(session, "@enkore/typescript")

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
	code += `import {\n`
	code += `\ttype EnkoreJSRuntimeProject,\n`
	code += `\ttype EnkoreJSRuntimeContext,\n`
	code += `\tcreateContext as enkoreCreateContext\n`
	code += `} from "@enkore/js-runtime/v0"\n`
	code += `import {getProject as enkoreGetProject} from "@enkore-target/${apiContext.target}/project"\n`
	code += `\n`
	code += `// vvv--- types needed for implementation\n`
	code += generateNeededTypeDeclarations(session, implementation)
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
	code += `\tproject: EnkoreJSRuntimeProject,\n`
	code += `\tctxOrOptions: EnkoreJSRuntimeContext|EnkoreJSRuntimeContextOptions\n`
	code += `): typeof __enkoreUserFunction {\n`

	code += `\tconst context: EnkoreJSRuntimeContext = enkoreCreateContext(project, ctxOrOptions)\n`

	if (hasDependencies) {
		code += `\tconst dependencies: __EnkoreFunctionDependencies = `

		code += (() => {
			if (!dependencies.length) return `{}`

			let tmp = `{\n`

			for (const [i, dependency] of dependencies.entries()) {
				tmp += `\t\t${dependency.key}: __enkoreDep${i}(context),\n`
			}

			tmp = tmp.slice(0, -2)

			return `${tmp}\n\t}`
		})()

		code += `\n`
	}

	code += `\n`
	code += `\tconst localContext: EnkoreJSRuntimeContext = {\n`
	code += `\t\t...context,\n`
	code += `\t\tproject: {\n`
	code += `\t\t\tpackageJSON: enkoreGetProject().packageJSON\n`
	code += `\t\t}\n`
	code += `\t}\n`
	code += `\n`

	code += `\tconst fn: any = ${asyncStr("async ")}function ${exportName}(...args: any[]) {\n`
	code += `\t\t// @ts-ignore:next-line\n`
	code += `\t\treturn ${asyncStr("await ")}${implementation.name}(localContext, ${hasDependencies ? "dependencies, " : ""}...args);\n`
	code += `\t}\n`

	code += `\n`
	code += `\treturn fn;\n`

	code += `}\n`

	return code

	function functionDeclarationToString(decl: MyTSFunctionDeclaration) {
		let tmp = ``

		tmp += decl.jsDoc
		tmp += (decl.jsDoc.length ? "\n" : "")
		tmp += nodeMyTS.convertMyTSFunctionDeclarationToString({
			...decl,
			parameters: decl.parameters.slice(hasDependencies ? 2 : 1)
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
