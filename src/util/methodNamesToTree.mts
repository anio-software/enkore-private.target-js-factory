import type {ObjectPropertyTree} from "#~src/util/ObjectPropertyTree.d.mts"

export function methodNamesToTree(methodNames: string[]): ObjectPropertyTree {
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
