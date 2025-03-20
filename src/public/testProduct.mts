import type {API} from "#~src/API.d.mts"

const impl: API["testProduct"] = async function(
	session, productName
) {
	session.enkore.emitMessage("info", `testing '${productName}'`)
}

export const testProduct = impl
