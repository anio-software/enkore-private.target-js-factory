import type {AutogenerateAPIContext} from "../AutogenerateAPIContext.ts"
import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {MyTSFunctionDeclaration} from "@anio-software/enkore-private.target-js-toolchain_types"
import type {Options} from "./Options.ts"
import type {Variant} from "./Variant.ts"
import {_getImplementation} from "./_getImplementation.ts"
import {_functionDeclarationToString} from "./_functionDeclarationToString.ts"
import {generateNeededTypeDeclarations} from "./generateNeededTypeDeclarations.ts"

export function _generateTryFactoryCode(
	apiContext: AutogenerateAPIContext,
	session: EnkoreSessionAPI,
	options: Options,
	exportName: string,
	variant: Variant
) {
	const implementationFunctionName = (
		variant === "syncVariant"
	) ? "__implementationSync" : "__implementation"

	const {implementation, overloads} = _getImplementation(
		session, options.source, implementationFunctionName
	)

	const hasDependencies = implementation.parameters[1]?.type === "__EnkoreFunctionDependencies"

	let code = ``

	code += `import {AnioError as __AnioError} from "@anio-software/enkore.js-runtime"\n`
	code += `import {${exportName}Factory as factory} from "./${exportName}Factory.ts"\n`
	code += `\n`
	code += `// vvv--- types needed for implementation\n`
	code += generateNeededTypeDeclarations(apiContext, session, implementation)
	code += `// ^^^--- types needed for implementation\n`
	code += `\n`

	if (!overloads.length) {
		code += _functionDeclarationToString(session, updateReturnType(implementation), hasDependencies)
	} else {
		for (const overload of overloads) {
			code += _functionDeclarationToString(session, updateReturnType(overload), hasDependencies)
		}
	}

	code += `\n`
	code += `export function ${exportName}TryFactory(\n`
	code += `\tcontextOptions: EnkoreJSRuntimeContextOptions\n`
	code += `): typeof __enkoreUserFunction {\n`
	code += `\treturn factory({\n`
	code += `\t\t...contextOptions,\n`
	code += `\t\tnoThrow: true\n`
	code += `\t})\n`
	code += `}\n`

	return code

	function updateReturnType(decl: MyTSFunctionDeclaration): MyTSFunctionDeclaration {
		let rawReturnType = decl.returnType
		let newReturnType = `(${rawReturnType})|__AnioError`

		if (rawReturnType.startsWith("Promise<")) {
			rawReturnType = rawReturnType.slice("Promise<".length, -1)
			newReturnType = `Promise<(${rawReturnType})|__AnioError>`
		}

		return {
			...decl,
			returnType: newReturnType
		}
	}
}
