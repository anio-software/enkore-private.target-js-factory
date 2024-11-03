import {factory as f1} from "@fourtune/js-and-web-runtime-and-rollup-plugins/project/rollup-plugin"
import {factory as f2} from "@fourtune/js-and-web-runtime-and-rollup-plugins/runtime/rollup-plugin"
import {factory as f3} from "@fourtune/js-and-web-runtime-and-rollup-plugins/assets/rollup-plugin"
import {importStatement} from "./importStatement.mjs"
import {getEntryCode} from "./getEntryCode.mjs"

function getExportTypeAndName(filename) {
	if (filename.endsWith(".d.mts")) {
		return {
			type: "d.mts",
			name: filename.slice(0, -6)
		}
	} else if (filename.endsWith(".mts")) {
		return {
			type: "mts",
			name: filename.slice(0, -4)
		}
	}

	return false
}

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
	const output_modules = new Map()

	for (const source of fourtune_session.input.getSourceFiles()) {
		if (!source.parents.length) continue
		if (source.parents[0] !== "export") continue

		const parsed = getExportTypeAndName(source.name)

		if (!parsed) continue

		source.parents = source.parents.slice(1)

		const export_name = parsed.name
		const module_name = source.parents.length ? source.parents.join(".") : "default"

		if (!output_modules.has(module_name)) {
			output_modules.set(module_name, new Map())
		}

		const module_exports = output_modules.get(module_name)

		if (module_exports.has(export_name)) {
			const using = module_exports.get(export_name)

			fourtune_session.emitWarning(
				`pkg.duplicate_export`, {
					module_name, export_name, using
				}
			)
		} else {
			module_exports.set(export_name, source.source)
		}
	}

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

	for (const [module_name, module_exports] of output_modules.entries()) {
		const product = fourtune_session.products.addProduct(module_name)
		const entry_code = getEntryCode(module_exports)

		product.addDistributable(
			"bundle", [
				"index.mjs",
				"source.mjs",
				"source.d.mts"
			], async () => {
				const {tsBundler} = await fourtune_session.getDependency("@fourtune/base-realm-js-and-web")

				const code = await tsBundler(
					fourtune_session.getProjectRoot(),
					entry_code, {
						additional_plugins: plugins
					}
				)

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
				const {tsBundler} = await fourtune_session.getDependency("@fourtune/base-realm-js-and-web")

				const code = await tsBundler(
					fourtune_session.getProjectRoot(),
					entry_code, {
						additional_plugins: plugins,
						minify: true
					}
				)

				return [
					code,
					`export default ${JSON.stringify(code)};\n`,
					`declare const _default : string;\nexport default _default\n`
				]
			}
		)

		product.addDistributable("types", "index.d.mts",
			async () => {
				const {jsBundler} = await fourtune_session.getDependency("@fourtune/base-realm-js-and-web")
				let entry_code = ``

				for (const [export_name, source] of module_exports.entries()) {
					if (source.endsWith(".d.mts")) {

					} else if (source.endsWith(".mts")) {
						const extensionless_source = source.slice(0, -4)

						entry_code += importStatement(
							"./.fourtune/v0/objects/" + extensionless_source + ".d.mts", export_name, true
						)
					}
				}

				return await jsBundler(
					fourtune_session.getProjectRoot(),
					entry_code, {
						input_file_type: "dts",
						on_rollup_log_fn: console.log
					}
				)
			}
		)
	}
}
