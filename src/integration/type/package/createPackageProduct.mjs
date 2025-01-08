import {entryExportsToEntryCode} from "./entryExportsToEntryCode.mjs"
import {createPackageJSON} from "./createPackageJSON.mjs"

import {factory as f1} from "@fourtune/js-and-web-runtime-and-rollup-plugins/v0/project/rollup-plugin"
import {factory as f2} from "@fourtune/js-and-web-runtime-and-rollup-plugins/v0/runtime/rollup-plugin"
import {factory as f3} from "@fourtune/js-and-web-runtime-and-rollup-plugins/v0/assets/rollup-plugin"

function assetReporter(
	fourtune_session,
	assets,
	included_all_assets,
	reason
) {
	if (included_all_assets) {
		fourtune_session.emitWarning(
			`all_assets_included`, {reason}
		)
	}

	if (assets.length) {
		process.stderr.write(
			`The following assets will be included: \n\n`
		)

		for (const asset of assets) {
			process.stderr.write(
				` >    ${asset.url.padEnd(60, " ")} ${(asset.size / 1000).toFixed(1)} kBytes\n`
			)
		}

		process.stderr.write(`\n`)
	}
}

export async function createPackageProduct(
	fourtune_session,
	entryPointMap
) {
	const {
		jsBundler,
		tsTypeDeclarationBundler
	} = fourtune_session.getDependency("@fourtune/base-realm-js-and-web")

	const defaultPackage = fourtune_session.products.addProduct("package")

	defaultPackage.addDistributable(
		"package", "package.json", async () => {
			return createPackageJSON(fourtune_session, entryPointMap)
		}
	)

	const plugin1 = await f1(fourtune_session.getProjectRoot())
	const plugin2 = await f2(fourtune_session.getProjectRoot())
	const plugin3 = await f3(fourtune_session.getProjectRoot(), (...args) => {
		assetReporter(fourtune_session,...args)
	})

	const plugins = [plugin1, plugin2, plugin3].map(plugin => {
		return {
			when: "pre",
			plugin
		}
	})

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

		defaultPackage.addDistributable(
			"",
			[
				`entries/${entryPointFileName}/index.mjs`,
				`entries/${entryPointFileName}/index.min.mjs`,
				`entries/${entryPointFileName}/source.mjs`,
				`entries/${entryPointFileName}/source.min.mjs`,
				`entries/${entryPointFileName}/index.d.mts`,
				`entries/${entryPointFileName}/index.min.d.mts`,
				`entries/${entryPointFileName}/source.d.mts`,
				`entries/${entryPointFileName}/source.min.d.mts`
			],
			async () => {
				const entryCode = entryExportsToEntryCode(
					fourtune_session,
					entryPointExports,
					"index.mjs"
				)

				const typingsFileEntryCode = entryExportsToEntryCode(
					fourtune_session,
					entryPointExports,
					"index.d.mts"
				)

				const indexMjs = await jsBundler(
					fourtune_session.getProjectRoot(),
					entryCode, {
						externals,
						additional_plugins: plugins,
						on_rollup_log_fn,
						minify: false
					}
				)

				const indexMjsMinified = await jsBundler(
					fourtune_session.getProjectRoot(),
					entryCode, {
						externals,
						additional_plugins: plugins,
						on_rollup_log_fn,
						minify: true
					}
				)

				const indexTypes = await tsTypeDeclarationBundler(
					fourtune_session.getProjectRoot(),
					typingsFileEntryCode,
					{
						externals,
						on_rollup_log_fn
					}
				)

				function exportSource(src) {
					return `export default ${JSON.stringify(src)};\n`
				}

				return [
					indexMjs,						// index.mjs
					indexMjsMinified,				// index.min.mjs
					exportSource(indexMjs),			// source.mjs
					exportSource(indexMjsMinified),	// source.min.mjs

					indexTypes,						// index.d.mts
					indexTypes,						// index.min.d.ms
					`declare const _default : string;\nexport default _default\n`,
					`declare const _default : string;\nexport default _default\n`
				]
			}
		)
	}
}
