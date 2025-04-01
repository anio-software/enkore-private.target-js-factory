import type {API} from "#~src/API.d.mts"
import type {APIContext} from "#~src/APIContext.d.mts"

const impl: API["testProduct"] = async function(
	this: APIContext, session, productName
) {
	session.enkore.emitMessage("info", `testing '${productName}'`)
}

export const testProduct = impl
