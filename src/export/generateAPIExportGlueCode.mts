type ObjectPropertyTree = Map<string, ObjectPropertyTree|"method">

function methodNamesToTree(methodNames: string[]): ObjectPropertyTree {
	const map: ObjectPropertyTree = new Map()

	for (const methodName of methodNames) {
		const parts = ["__root", ...methodName.split("/")]

		let currentMap: ObjectPropertyTree = map

		for (let i = 0; i < parts.length; ++i) {
			const part = parts[i]
			const isMethodPart = (i + 1) === parts.length

			if (isMethodPart) {
				currentMap.set(part, "method")
			} else {
				if (!currentMap.has(part)) {
					currentMap.set(part, new Map())
				}

				currentMap = currentMap.get(part) as ObjectPropertyTree
			}
		}
	}

	return map.get("__root") as ObjectPropertyTree
}

function printTree(
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
			code += printTree(apiVariable, value, depth + 1, currentPath, key)
		}
	}

	return code + `${indent0}}\n`
}

export function generateAPIExportGlueCode(
	apiType: string,
	apiVariable: string,
	methodNames: string[]
): string {
	const apiMethodTree = methodNamesToTree(methodNames)

	let code = ``

	for (const [key, value] of apiMethodTree) {
		code += `export const ${key}: ${apiType}["${key}"] = `

		if (value === "method") {
			code += `${apiVariable}["${key}"];\n`
		} else {
			code += printTree(apiVariable, value, 0, key)
		}
	}

	return code
}
