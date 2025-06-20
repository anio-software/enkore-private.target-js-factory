import type {API} from "#~src/targetIntegration/API.ts"
import type {APIContext} from "#~src/targetIntegration/APIContext.ts"

const impl: API["hook"]["preCompile"] = async function(
	this: APIContext, session
) {

}

export function preCompileFactory(context: APIContext) {
	return impl!.bind(context)
}
