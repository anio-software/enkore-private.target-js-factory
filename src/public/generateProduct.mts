import type {API} from "#~src/API.d.mts"

const impl: API["generateProduct"] = async function(
	session, productName
) {
//	session.enkore.emitMessage("info", "called generateProduct")
	console.log("generateProduct", productName)
}

export const generateProduct = impl
