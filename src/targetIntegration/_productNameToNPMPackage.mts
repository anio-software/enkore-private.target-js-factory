import type {EnkoreSessionAPI} from "@asint/enkore__spec"
import type {NPMPackage} from "./InternalData.d.mts"
import {getInternalData} from "./getInternalData.mts"

export function _productNameToNPMPackage(
	session: EnkoreSessionAPI,
	productName: string
): [number, NPMPackage] {
	let packages: NPMPackage[] = []

	if (productName.startsWith("npmPackage_")) {
		packages = getInternalData(session).npmPackages
	} else if (productName.startsWith("npmTypesPackage_")) {
		packages = getInternalData(session).npmTypesPackages
	} else {
		throw new Error(`Invalid product name '${productName}'.`)
	}

	// we know productName contains an underscore because of the checks
	// done above
	const packageIndex = parseInt(productName.slice(
		productName.indexOf("_") + 1
	), 10)

	if (packageIndex >= packages.length) {
		throw new Error(`unknown product '${productName}'`)
	}

	return [packageIndex, packages[packageIndex]]
}
