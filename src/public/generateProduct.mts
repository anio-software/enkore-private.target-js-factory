import type {API} from "#~src/API.d.mts"
import {generateNPMPackage} from "#~src/generateNPMPackage.mts"

const impl: API["generateProduct"] = async function(session, productName) {
	if (productName === "package") {
		await generateNPMPackage(session)
	}
}

export const generateProduct = impl
