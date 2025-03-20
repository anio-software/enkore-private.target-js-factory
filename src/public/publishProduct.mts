import type {API} from "#~src/API.d.mts"

const impl: API["publishProduct"] = async function(
	session, productName
) {
	session.enkore.emitMessage("info", `publishing '${productName}'`)
}

export const publishProduct = impl
