import {exportStatement} from "./exportStatement.mjs"

export function getTypeEntryCode(fourtune_session, entryPointExportMap) {
	const {getObjectsPath} = fourtune_session.paths

	let entry_code = ``

	for (const [exportName, {type, source, extensionlessSource}] of entryPointExportMap.entries()) {
		if (type === "d.mts") {
			entry_code += exportStatement(
				getObjectsPath(source),
				exportName,
				true
			)
		} else if (type === "mts") {
			entry_code += exportStatement(
				getObjectsPath(`${extensionlessSource}.d.mts`),
				exportName,
				true
			)
		}
	}

	return entry_code
}
