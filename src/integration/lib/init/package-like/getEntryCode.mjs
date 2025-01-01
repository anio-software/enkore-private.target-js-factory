import {generateExportStatement} from "./generateExportStatement.mjs"

export function getEntryCode(
	fourtune_session,
	entryPointExportMap
) {
	const {getObjectsPath} = fourtune_session.paths

	let entry_code = ``

	for (const [exportName, {type, extensionlessSource}] of entryPointExportMap.entries()) {
		if (type !== "mts") continue

		entry_code += generateExportStatement(
			getObjectsPath(`${extensionlessSource}.mjs`),
			exportName,
			false
		)
	}

	return entry_code
}
