import type {API} from "#~src/targetIntegration/API.ts"
import type {APIContext} from "#~src/targetIntegration/APIContext.ts"
import {getInternalData} from "#~src/targetIntegration/getInternalData.ts"

const impl: API["hook"]["postCompile"] = async function(
	this: APIContext, session
) {
	// todo: remove me in the future
	getInternalData(session)._backwardsCompatPostCompileHook.needsManualInvocation = false
}

export function postCompileFactory(context: APIContext) {
	return impl!.bind(context)
}
