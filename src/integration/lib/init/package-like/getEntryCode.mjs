import {exportStatement} from "./exportStatement.mjs"

export function getEntryCode(
	fourtune_session,
	entryPointExportMap
) {
	const {getObjectsPath} = fourtune_session.paths

	let entry_code = ``

	for (const [export_name, {type, extensionlessSource}] of entryPointExportMap.entries()) {
		if (type !== "mts") continue

		entry_code += exportStatement(
			getObjectsPath(`${extensionlessSource}.mjs`),
			export_name,
			false
		)
	}

	return entry_code
}
