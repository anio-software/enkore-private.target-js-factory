export function entryExportsToExportObjectType(
	fourtune_session, entryPointExports
) {
	let counter = 0

	const {getObjectsPath} = fourtune_session.paths

	let importCode = ``
	let code = `export type __ModuleImportObject = {\n`

	for (const [exportName, exportDescriptor] of entryPointExports.entries()) {
		if (exportDescriptor.isTypeOnly) continue

		const extensionlessOrigin = exportDescriptor.origin.slice(0, -4)

		importCode += `import {${exportName} as __anonImport${counter}} from "${getObjectsPath(`${extensionlessOrigin}.mjs`)}"\n`

		code += `\t${exportName}: typeof __anonImport${counter},\n`

		++counter
	}

	code += `}\n`

	return importCode + code
}
