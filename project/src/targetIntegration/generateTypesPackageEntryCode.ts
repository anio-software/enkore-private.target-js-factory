import type {EntryPoint} from "./InternalData.d.mts"

export function generateTypesPackageEntryCode(
	entryPoint: EntryPoint
): string {
	let importCode = ``, code = ``

	code += `export type __ModuleExport = {\n`

	for (const [exportName, meta] of entryPoint.exports.entries()) {
		if (meta.isTSXComponent) continue

		importCode += `import {${exportName}} from "./${meta.pathToJsFile}"\n`

		if (meta.descriptor.kind !== "type") {
			code += `    ${exportName}: typeof ${exportName},\n`
		}
	}

	code += `}\n`

	for (const [exportName, meta] of entryPoint.exports.entries()) {
		if (meta.isTSXComponent) continue
		if (meta.descriptor.kind !== "type") continue

		code += `export type {${exportName}} from "./${meta.pathToDtsFile}"\n`
	}

	return importCode + code
}
