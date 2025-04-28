import type {EnkoreSessionAPI} from "@enkore/spec"
import type {
	MyTSFunctionDeclaration,
	MyTSTopLevelTypeDescriptor
} from "@enkore-types/target-js-toolchain"
import {getTargetDependency} from "#~src/targetIntegration/getTargetDependency.mts"

export function generateNeededTypeDeclarations(
	session: EnkoreSessionAPI,
	implementation: MyTSFunctionDeclaration
): string {
	const nodeMyTS = getTargetDependency(session, "@enkore/typescript")
	const typesNeeded: MyTSTopLevelTypeDescriptor[] = []
	const typesPicked: Map<string, true> = new Map()

	const typeTree = nodeMyTS.getRequiredTopLevelTypesForNode(implementation)

	typeTree.depthFirstTraversal(node => {
		typesNeeded.push(node.getData())
	})

	typesNeeded.reverse()

	let code = ``

	for (const type of typesNeeded) {
		if (type.name === "node()") continue
		if (typesPicked.has(type.name)) continue

		if (type.source === "import") {
			if (type.importDeclaration.moduleSpecifier.startsWith("@enkore/js-runtime")) {
				continue
			}
		}

		code += type.declaration.trimEnd()
		code += `\n`

		typesPicked.set(type.name, true)
	}

	return code
}
