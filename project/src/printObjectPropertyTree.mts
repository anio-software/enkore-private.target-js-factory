import type {ObjectPropertyTree} from "./ObjectPropertyTree.d.mts"

export function printObjectPropertyTree(
	apiVariable: string,
	rootNode: ObjectPropertyTree,
	depth: number = 0,
	rootPath: string = "",
	currentKey: string = ""
) {
	const indent0 = "\t".repeat(depth)
	const indent = "\t".repeat(depth + 1)
	let code = ``

	code += `${indent0}`

	if (currentKey.length) {
		code += `"${currentKey}":`
	}

	code += `{\n`

	for (const [key, value] of rootNode.entries()) {
		const currentPath = !rootPath.length ? key : `${rootPath}.${key}`

		if (value === "method") {
			code += `${indent}"${key}": `

			let tmp = `${apiVariable}`

			for (const part of currentPath.split(".")) {
				tmp += `["${part}"]`
			}

			code += `${tmp},\n`
		} else {
			code += printObjectPropertyTree(apiVariable, value, depth + 1, currentPath, key)
		}
	}

	return code + `${indent0}}\n`
}
