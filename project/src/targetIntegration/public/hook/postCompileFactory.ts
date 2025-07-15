import type {API} from "#~src/targetIntegration/API.ts"
import type {APIContext} from "#~src/targetIntegration/APIContext.ts"
import {getInternalData} from "#~src/targetIntegration/getInternalData.ts"
import {_postCompileHookRemoveMeInFuture} from "#~src/targetIntegration/_postCompileHookRemoveMeInFuture.ts"

const impl: API["hook"]["postCompile"] = async function(
	this: APIContext, session
) {
	// todo: remove me in the future
	await _postCompileHookRemoveMeInFuture(this, session)

	getInternalData(session)._backwardsCompatPostCompileHook.needsManualInvocation = false
}

export function postCompileFactory(context: APIContext) {
	return impl!.bind(context)
}
