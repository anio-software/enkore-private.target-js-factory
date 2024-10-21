import path from "node:path"

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
}

function getModuleNameFromPath(relative_path) {
	// normalize src/auto/export and export/
	if (relative_path.startsWith("auto/")) {
		relative_path = relative_path.slice("auto/".length)
	}

	if (relative_path.startsWith("export/")) {
		relative_path = relative_path.slice("export/".length)
	}

	let module_name = path.dirname(relative_path)

	if (module_name === ".") module_name = "default"

	return module_name.split("/").join("__")
}

function normalizeInputFiles(fourtune_session) {
	const files = fourtune_session.getProjectSourceFiles()
	const input_files = []

	for (const file of files) {
		if (!file.name.endsWith(".mts")) {
			fourtune_session.addWarning(`pkg.unsupported_file`, {relative_path: file.relative_path})
		} else {
			input_files.push(file)
		}
	}

	return input_files.filter(file => {
		if (file.type !== "file") return false
		if (!file.relative_path.endsWith(".mts")) return false

		if (
		    !file.relative_path.startsWith("auto/export/") &&
		    !file.relative_path.startsWith("export/")
		) {
			return false
		}

		return true
	}).map(({relative_path, name}) => {
		return {
			module_name: getModuleNameFromPath(relative_path),
			export_name: getExportTypeAndName(name).name,
			source: relative_path
		}
	})
}

export default async function(fourtune_session) {
	const output_modules = new Map()

	// NB: DON'T scan FS for auto files use fourtune_session.getProjectSourceFiles() instead!
	const input = normalizeInputFiles(fourtune_session)

	// first, get a list of all modules we expect to export later
	for (const {
		module_name,
		export_name,
		source
	} of input) {

		if (!output_modules.has(module_name)) {
			output_modules.set(module_name, new Map())
		}

		const module_exports = output_modules.get(module_name)

		if (module_exports.has(export_name)) {
			const using = module_exports.get(export_name)

			fourtune_session.addWarning(
				`pkg.duplicate_export`, {
					module_name, export_name, using
				}
			)
		} else {
			module_exports.set(
				export_name, source
			)
		}
	}

	return output_modules
}
