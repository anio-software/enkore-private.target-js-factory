import type {API} from "#~src/API.d.mts"
import type {APIContext} from "#~src/APIContext.d.mts"

const impl: API["hook"]["preCompile"] = async function(
	this: APIContext, session
) {

}

export const preCompile = impl
