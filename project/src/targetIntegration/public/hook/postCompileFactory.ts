import type {API} from "#~src/targetIntegration/API.ts"
import type {APIContext} from "#~src/targetIntegration/APIContext.ts"

const impl: API["hook"]["postCompile"] = async function(
	this: APIContext, session
) {

}

export function postCompileFactory(context: APIContext) {
	return impl!.bind(context)
}
