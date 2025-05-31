import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"

const impl: API["getToolchainToInstall"] = async function(
	this: APIContext, projectRoot, projectConfig
) {
	return ["js", 40]
}

export function getToolchainToInstallFactory(context: APIContext) {
	return impl!.bind(context)
}
