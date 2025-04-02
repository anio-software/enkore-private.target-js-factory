import type {API} from "#~src/API.d.mts"
import type {APIContext} from "#~src/APIContext.d.mts"
import {generateNPMPackage} from "#~src/generateNPMPackage.mts"
import {generateNPMTypesPackage} from "#~src/generateNPMTypesPackage.mts"

const impl: API["generateProduct"] = async function(
	this: APIContext, session, productName
) {
	if (productName === "npmPackage") {
		await generateNPMPackage(this, session)
	} else if (productName === "npmTypesPackage") {
		await generateNPMTypesPackage(this, session)
	}
}

export function generateProductFactory(context: APIContext) {
	return impl!.bind(context)
}
