import {entryExportsToExportObjectType} from "./entryExportsToExportObjectType.mjs"

export function entryExportsToEntryCode(
	fourtune_session,
	entryPointExportMap,
	kind
) {
	const {getObjectsPath} = fourtune_session.paths

	let code = ``

	if (kind === "index.d.mts") {
		for (const [exportName, exportDescriptor] of entryPointExportMap.entries()) {
			const extensionlessOrigin = exportDescriptor.origin.slice(0, -4)

			code += `export type {${exportName}} from "${getObjectsPath(`${extensionlessOrigin}.d.mts`)}"\n`
		}

		code += entryExportsToExportObjectType(fourtune_session, entryPointExportMap)
	} else if (kind === "index.mjs") {
		for (const [exportName, exportDescriptor] of entryPointExportMap.entries()) {
			const extensionlessOrigin = exportDescriptor.origin.slice(0, -4)

			if (exportDescriptor.isTypeOnly) continue

			code += `export {${exportName}} from "${getObjectsPath(`${extensionlessOrigin}.mjs`)}"\n`
		}
	} else {
		throw new Error(`Invalid kind '${kind}'.`)
	}

	return code
}
