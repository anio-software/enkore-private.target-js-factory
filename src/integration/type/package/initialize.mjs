import {getEntryPointMap} from "./getEntryPointMap.mjs"
import {createPackageProduct} from "./createPackageProduct.mjs"
import {createPackageTypesProduct} from "./createPackageTypesProduct.mjs"

export async function initPackageProject(fourtune_session) {
	const entryPointMap = await getEntryPointMap(fourtune_session)

	await createPackageProduct(fourtune_session, entryPointMap)
	await createPackageTypesProduct(fourtune_session, entryPointMap)
}
