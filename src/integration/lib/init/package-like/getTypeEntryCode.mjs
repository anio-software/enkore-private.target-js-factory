import {exportStatement} from "./exportStatement.mjs"

export function getTypeEntryCode(fourtune_session, module_exports) {
	const {getObjectsPath} = fourtune_session.paths

	let entry_code = ``

	for (const [export_name, {type, source, extensionlessSource}] of module_exports.entries()) {
		if (type === "d.mts") {
			entry_code += exportStatement(
				getObjectsPath(source),
				export_name,
				true
			)
		} else if (type === "mts") {
			entry_code += exportStatement(
				getObjectsPath(`${extensionlessSource}.d.mts`),
				export_name,
				true
			)
		}
	}

	return entry_code
}
