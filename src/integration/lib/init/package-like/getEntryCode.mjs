import {importStatement} from "./importStatement.mjs"

export function getEntryCode(fourtune_session, module_exports) {
	const {getObjectsPath} = fourtune_session.paths

	let entry_code = ``

	for (const [export_name, source] of module_exports.entries()) {
		if (source.endsWith(".d.mts") || !source.endsWith(".mts")) {
			continue
		}

		const extensionless_source = source.slice(0, -4)

		entry_code += importStatement(
			getObjectsPath(`${extensionless_source + ".mjs"}`),
			export_name, false
		)
	}

	return entry_code
}
