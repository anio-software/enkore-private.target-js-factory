import type {API} from "#~src/targetIntegration/API.ts"
import type {APIContext} from "#~src/targetIntegration/APIContext.ts"

const impl: API["testProduct"] = async function(
	this: APIContext, session, productName
) {
	session.enkore.emitMessage("info", `testing '${productName}'`)
}

export function testProductFactory(context: APIContext) {
	return impl!.bind(context)
}
