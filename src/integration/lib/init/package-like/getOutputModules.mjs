import {isExpandableFilePath} from "@fourtune/js-and-web-runtime-and-rollup-plugins/v0/utils-api"

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

export function getOutputModules(fourtune_session) {
	const output_modules = new Map()

	for (const source of fourtune_session.input.getSourceFiles()) {
		if (!source.parents.length) continue
		if (source.parents[0] !== "export") continue
		// ignore .as.mts and .as.d.mts files
		if (isExpandableFilePath(source.name)) continue

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

	return output_modules
}
