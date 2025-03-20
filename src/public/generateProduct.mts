import type {API} from "#~src/API.d.mts"
import {generateNPMPackage} from "#~src/generateNPMPackage.mts"
import {generateNPMTypesPackage} from "#~src/generateNPMTypesPackage.mts"

const impl: API["generateProduct"] = async function(session, productName) {
	if (productName === "package") {
		await generateNPMPackage(session)
	} else if (productName === "typesPackage") {
		await generateNPMTypesPackage(session)
	}
}

export const generateProduct = impl
