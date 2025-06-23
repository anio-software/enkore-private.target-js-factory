import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {
	MyTSFunctionDeclaration,
	MyTSTopLevelTypeDescriptor
} from "@anio-software/enkore-private.target-js-toolchain_types"
import type {AutogenerateAPIContext} from "#~src/autogenerate/AutogenerateAPIContext.ts"

export function generateNeededTypeDeclarations(
	apiContext: AutogenerateAPIContext,
	session: EnkoreSessionAPI,
	implementation: MyTSFunctionDeclaration
): string {
	const toolchain = session.target._getToolchain("js")
	const typesNeeded: MyTSTopLevelTypeDescriptor[] = []
	const typesPicked: Map<string, true> = new Map()

	const typeTree = toolchain.tsGetRequiredTopLevelTypesForNode(implementation)

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
