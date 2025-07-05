import type {API} from "#~src/targetIntegration/API.ts"
import type {APIContext} from "#~src/targetIntegration/APIContext.ts"
import {__getToolchainVersionToInstall} from "#~src/__getToolchainVersionToInstall.ts"

const impl: API["getToolchainToInstall"] = async function(
	this: APIContext, earlySession
) {
	return ["js", __getToolchainVersionToInstall()]
}

export function getToolchainToInstallFactory(context: APIContext) {
	return impl!.bind(context)
}
