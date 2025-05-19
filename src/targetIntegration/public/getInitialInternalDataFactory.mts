import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"

const impl: API["getInitialInternalData"] = async function(
	this: APIContext, projectRoot, projectConfig
) {
	return {
		entryPointMap: new Map()
	}
}

export function getInitialInternalDataFactory(context: APIContext) {
	return impl!.bind(context)
}
