import type {InternalData} from "./InternalData.d.mts"

type EntryPointMap = InternalData["entryPointMap"]
// thanks to josephjnk https://www.reddit.com/r/typescript/comments/hf5g3a/comment/fvvn0ez/
type MapValueType<A> = A extends Map<any, infer V> ? V : never;
type EntryPoint = MapValueType<EntryPointMap>

export function generateTypesPackageEntryCode(
	entryPoint: EntryPoint
): string {
	let importCode = ``, code = ``

	code += `export type __ModuleExport = {\n`

	for (const [exportName, meta] of entryPoint.entries()) {
		importCode += `import {${exportName}} from "./${meta.pathToJsFile}"\n`

		if (meta.descriptor.kind !== "type") {
			code += `    ${exportName}: typeof ${exportName},\n`
		}
	}

	code += `}\n`

	for (const [exportName, meta] of entryPoint.entries()) {
		if (meta.descriptor.kind !== "type") continue

		code += `export type {${exportName}} from "./${meta.pathToDtsFile}"\n`
	}

	return importCode + code
}
