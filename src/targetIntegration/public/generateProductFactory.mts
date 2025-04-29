import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import {generateNPMPackage} from "#~src/targetIntegration/generateNPMPackage.mts"
import {generateNPMTypesPackage} from "#~src/targetIntegration/generateNPMTypesPackage.mts"

const impl: API["generateProduct"] = async function(
	this: APIContext, session, productName
) {
	const packageNames: string[] = (() => {
		const targetConfig = session.target.getOptions(this.target)

		if (!Array.isArray(targetConfig.publish?.withPackageNames)) {
			return []
		}

		return targetConfig.publish?.withPackageNames
	})()

	if (!packageNames.length) {
		if (productName === "npmPackage") {
			await generateNPMPackage(
				this,
				session,
				`products/npmPackage`,
				session.project.packageJSON.name
			)
		} else if (productName === "npmTypesPackage") {
			await generateNPMTypesPackage(
				this,
				session,
				`products/npmTypesPackage`,
				session.project.packageJSON.name
			)
		} else {
			throw new Error(`Invalid product name '${productName}'.`)
		}

		return
	}

	if (!productName.startsWith("npmPackage_") &&
		!productName.startsWith("npmTypesPackage_")
	) {
		throw new Error(`Invalid product name '${productName}'.`)
	}
}

export function generateProductFactory(context: APIContext) {
	return impl!.bind(context)
}
