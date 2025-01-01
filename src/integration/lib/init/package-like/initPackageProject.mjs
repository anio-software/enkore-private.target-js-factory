import {factory as f1} from "@fourtune/js-and-web-runtime-and-rollup-plugins/v0/project/rollup-plugin"
import {factory as f2} from "@fourtune/js-and-web-runtime-and-rollup-plugins/v0/runtime/rollup-plugin"
import {factory as f3} from "@fourtune/js-and-web-runtime-and-rollup-plugins/v0/assets/rollup-plugin"
import {getEntryCode} from "./getEntryCode.mjs"
import {getTypeEntryCode} from "./getTypeEntryCode.mjs"
import {getEntryPointMap} from "./getEntryPointMap.mjs"
import path from "node:path"

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

export async function initPackageProject(fourtune_session) {
	const {getObjectsPath} = fourtune_session.paths
	const entryPointMap = getEntryPointMap(fourtune_session)

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

	const on_rollup_log_fn = console.log

	for (const [entryPointName, entryPointExportMap] of entryPointMap.entries()) {
		const product = fourtune_session.products.addProduct(entryPointName)
		const entry_code = getEntryCode(fourtune_session, entryPointExportMap)
		const type_entry_code = getTypeEntryCode(fourtune_session, entryPointExportMap)

		async function bundle(minify) {
			const {jsBundler} = fourtune_session.getDependency("@fourtune/base-realm-js-and-web")

			return await jsBundler(
				fourtune_session.getProjectRoot(),
				entry_code, {
					externals,
					additional_plugins: plugins,
					minify,
					on_rollup_log_fn
				}
			)
		}

		product.addDistributable(
			"bundle", [
				"index.mjs",
				"source.mjs",
				"source.d.mts"
			], async () => {
				const code = await bundle(false)

				return [
					code,
					`export default ${JSON.stringify(code)};\n`,
					`declare const _default : string;\nexport default _default\n`
				]
			}
		)

		product.addDistributable(
			"bundle", [
				"index.min.mjs",
				"source.min.mjs",
				"source.min.d.mts"
			], async () => {
				const code = await bundle(true)

				return [
					code,
					`export default ${JSON.stringify(code)};\n`,
					`declare const _default : string;\nexport default _default\n`
				]
			}
		)

		product.addDistributable(
			"types", [
				"index.d.mts",
				"index.min.d.mts",
				"ModuleExport.d.mts"
			], async () => {
				const {tsTypeDeclarationBundler} = fourtune_session.getDependency("@fourtune/base-realm-js-and-web")
				let exported_symbols = []

				for (const [export_name, {source}] of entryPointExportMap.entries()) {
					let source_path = source

					// d.mts files will never have an export name of
					// __star_export, __index or __default
					if (source.endsWith(".d.mts")) {
						exported_symbols.push({
							name: export_name,
							is_type_only: true,
							type_source: getObjectsPath(source)
						})
					} else if (source.endsWith(".mts")) {
						const extensionless_source = source.slice(0, -4)
						source_path = getObjectsPath(`${extensionless_source}.d.mts`)

						// __star_export and __index
						// both can have an arbitrary amount of named
						// exports so we first have to de-star them
						// (we could do this with every export but
						//  it's an expensive operation)
						if (export_name === "__star_export" || export_name === "__index") {
							for (const name of await getExportNames(source_path)) {
								exported_symbols.push({
									name,
									is_type_only: false,
									type_source: source_path
								})
							}
						} else {
							exported_symbols.push({
								name: export_name === "__default" ? "default" : export_name,
								is_type_only: false,
								type_source: source_path
							})
						}
					}
				}

				let entry_code_2 = ``

				for (const symbol of exported_symbols) {
					if (symbol.name !== "default") {
						entry_code_2 += `import type {${symbol.name}} from "${symbol.type_source}"\n`
					} else {
						entry_code_2 += `import type __default_import from "${symbol.type_source}"\n`
					}
				}

				entry_code_2 += `\n`
				entry_code_2 += `export type ModuleExport = {\n`

				for (const symbol of exported_symbols) {
					if (symbol.is_type_only) {
						entry_code_2 += `    ${symbol.name}: ${symbol.name},\n`
					} else {
						if (symbol.name === "default") {
							entry_code_2 += `    ${symbol.name}: typeof __default_import,\n`
						} else {
							entry_code_2 += `    ${symbol.name}: typeof ${symbol.name},\n`
						}
					}
				}

				entry_code_2 += `}\n`

				const index_dmts = await tsTypeDeclarationBundler(
					fourtune_session.getProjectRoot(),
					type_entry_code, {
						externals,
						on_rollup_log_fn
					}
				)

				return [
					index_dmts,
					index_dmts,
					await tsTypeDeclarationBundler(
						fourtune_session.getProjectRoot(),
						entry_code_2, {
							externals,
							on_rollup_log_fn
						}
					)
				]

				async function getExportNames(source) {
					const {
						parseCode,
						getExportsRecursive
					} = fourtune_session.getDependency("@aniojs/node-ts-utils")

					return getExportsRecursive(
						path.join(fourtune_session.getProjectRoot(), "index.mts"),
						parseCode(`export type * from "./${source}"`)
					).exportNames
				}
			}
		)
	}
}
