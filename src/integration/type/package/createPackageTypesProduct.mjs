import {entryExportsToEntryCode} from "./entryExportsToEntryCode.mjs"
import {createPackageJSON} from "./createPackageJSON.mjs"

export async function createPackageTypesProduct(
	fourtune_session,
	entryPointMap
) {
	const {
		tsTypeDeclarationBundler
	} = fourtune_session.getDependency("@fourtune/base-realm-js-and-web")

	const packageTypes = fourtune_session.products.addProduct("packageTypes")

	packageTypes.addDistributable(
		"package", "package.json", async () => {
			return createPackageJSON(fourtune_session, entryPointMap, true)
		}
	)

	let externals = []

	if ("external_npm_packages" in fourtune_session.getRealmOptions()) {
		externals = fourtune_session.getRealmOptions().external_npm_packages
	}

	// tbd
	const on_rollup_log_fn = (level, msg) => {
		fourtune_session.emit.warning(undefined, `rollup says: ${level}: ${msg}.`)
	}

	for (const [entryPointName, entryPointExports] of entryPointMap.entries()) {
		const entryPointFileName = entryPointName.split("/").join(".")

		packageTypes.addDistributable(
			"",
			`entries/${entryPointFileName}/index.min.d.mts`,
			async () => {
				const typingsFileEntryCode = entryExportsToEntryCode(
					fourtune_session,
					entryPointExports,
					"index.d.mts"
				)

				return await tsTypeDeclarationBundler(
					fourtune_session.getProjectRoot(),
					typingsFileEntryCode,
					{
						externals,
						on_rollup_log_fn
					}
				)
			}
		)
	}
}
