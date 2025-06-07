import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"

const impl: API["getToolchainToInstall"] = async function(
	this: APIContext, earlySession
) {
	return ["js", 42]
}

export function getToolchainToInstallFactory(context: APIContext) {
	return impl!.bind(context)
}
