import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import {generateNPMPackage} from "#~src/targetIntegration/generateNPMPackage.mts"
import {generateNPMTypesPackage} from "#~src/targetIntegration/generateNPMTypesPackage.mts"

const impl: API["generateProduct"] = async function(
	this: APIContext, session, productName
) {
	if (productName === "npmPackage") {
		await generateNPMPackage(this, session, `products/npmPackage`, session.project.packageJSON.name)
	} else if (productName === "npmTypesPackage") {
		await generateNPMTypesPackage(this, session, `products/npmTypesPackage`, session.project.packageJSON.name)
	}
}

export function generateProductFactory(context: APIContext) {
	return impl!.bind(context)
}
