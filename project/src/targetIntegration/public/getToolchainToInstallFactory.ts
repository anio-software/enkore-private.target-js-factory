import type {API} from "#~src/targetIntegration/API.ts"
import type {APIContext} from "#~src/targetIntegration/APIContext.ts"

const impl: API["getToolchainToInstall"] = async function(
	this: APIContext, earlySession
) {
	return ["js", 57]
}

export function getToolchainToInstallFactory(context: APIContext) {
	return impl!.bind(context)
}
