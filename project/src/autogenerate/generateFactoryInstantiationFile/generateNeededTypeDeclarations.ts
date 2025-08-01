import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {
	MyTSFunctionDeclaration,
	MyTSTopLevelTypeDescriptor
} from "@anio-software/enkore-private.target-js-toolchain_types"
import type {AutogenerateAPIContext} from "#~src/autogenerate/AutogenerateAPIContext.ts"
import {getToolchain} from "#~src/getToolchain.ts"

export function generateNeededTypeDeclarations(
	apiContext: AutogenerateAPIContext,
	session: EnkoreSessionAPI,
	implementation: MyTSFunctionDeclaration
): string {
	const toolchain = getToolchain(session)
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

		code += type.declaration.trimEnd()
		code += `\n`

		typesPicked.set(type.name, true)
	}

	return code
}
