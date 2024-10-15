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

export default async function(fourtune_session) {
	const output_modules = new Map()

	// DON'T scan FS for auto files use fourtune_session.getProjectSourceFiles() instead!
	const entries = fourtune_session.getProjectSourceFiles().map(entry => {
		// normalize src/auto/ to simply be src/
		if (entry.parents.length > 1 && entry.parents[0] === "auto") {
			return {
				...entry,
				parents: entry.parents.slice(1)
			}
		}

		return entry
	}).filter(entry => {
		// only consider files inside src/export
		if (!entry.parents.length) return false

		if (entry.parents[0] !== "export") return false

		return true
	}).map(entry => {
		return {
			...entry,
			parents: entry.parents.slice(1)
		}
	})

	for (const entry of entries) {
		const {relative_path} = entry

		if (entry.type !== "file") continue

		if (
			!entry.name.endsWith(".mts") &&
			!entry.name.endsWith(".d.mts")
		) {
			fourtune_session.addWarning(
				`pkg.unsupported_file`, {relative_path}
			)

			continue
		}

		if (entry.parents.length > 1) {
			fourtune_session.addWarning(
				`pkg.nested_export`, {relative_path}
			)

			continue
		}

		let assigned_module = "default"

		if (entry.parents.length) {
			assigned_module = entry.parents[0]
		}

		if (!output_modules.has(assigned_module)) {
			output_modules.set(assigned_module, new Map())
		}

		const module_exports = output_modules.get(assigned_module)
		const {type, name} = getExportTypeAndName(entry.name)

		const module_exports_path = `${name}.${type}`

		if (module_exports.has(module_exports_path)) {
			const using = module_exports.get(module_exports_path)

			fourtune_session.addWarning(
				`pkg.duplicate_export`, {relative_path, using}
			)
		} else {
			module_exports.set(
				module_exports_path,
				{
					path: path.join("src", entry.relative_path),
					type,
					export_name: name
				}
			)
		}
	}

	return output_modules
}
