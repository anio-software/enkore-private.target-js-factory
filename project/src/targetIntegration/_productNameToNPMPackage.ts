import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {NPMPackage} from "./InternalData.ts"
import {getInternalData} from "./getInternalData.ts"

export function _productNameToNPMPackage(
	session: EnkoreSessionAPI,
	productName: string
): [number, NPMPackage] {
	if (!productName.startsWith("npmPackage_")) {
		throw new Error(`Invalid product name '${productName}'.`)
	}

	const packages = getInternalData(session).npmPackages

	// we know productName contains an underscore because of the check done above
	const packageIndex = parseInt(productName.slice(
		productName.indexOf("_") + 1
	), 10)

	if (packageIndex >= packages.length) {
		throw new Error(`unknown product '${productName}'`)
	}

	return [packageIndex, packages[packageIndex]]
}
