import {methodNamesToTree} from "#~src/methodNamesToTree.ts"
import {printObjectPropertyTree} from "#~src/printObjectPropertyTree.ts"

export function generateAPIExportGlueCode(
	apiType: string,
	apiVariable: string,
	methodNames: string[]
): string {
	const apiMethodTree = methodNamesToTree(methodNames)

	let code = ``

	code += `export const apiID = ${apiVariable}.apiID\n`
	code += `export const apiMajorVersion =  ${apiVariable}.apiMajorVersion\n`
	code += `export const apiRevision = ${apiVariable}.apiRevision\n`

	for (const [key, value] of apiMethodTree) {
		code += `export const ${key}: ${apiType}["${key}"] = `

		if (value === "method") {
			code += `${apiVariable}["${key}"];\n`
		} else {
			code += printObjectPropertyTree(apiVariable, value, 0, key)
		}
	}

	return code
}
