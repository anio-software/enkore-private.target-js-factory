import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {MyTSFunctionDeclaration} from "@anio-software/enkore-private.target-js-toolchain_types"
import {getToolchain} from "#~src/getToolchain.ts"

export function _functionDeclarationToString(
	session: EnkoreSessionAPI,
	decl: MyTSFunctionDeclaration,
	hasDependencies: boolean
): string {
	const toolchain = getToolchain(session)

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
