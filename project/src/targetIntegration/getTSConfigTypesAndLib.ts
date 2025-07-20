import type {TargetIdentifier} from "@anio-software/enkore-private.spec/primitives"
import {
	targetsNodeDirectly,
	targetsNode,
	targetsWebDirectly,
	targetsWeb,
	targetsReact
} from "@anio-software/enkore-private.target-js-utils"

export function getTSConfigTypesAndLib(target: TargetIdentifier): {
	types: string[]
	lib: string[]
} {
	const types: string[] = []
	const lib: string[] = ["esnext"]

	if (targetsNodeDirectly(target)) {
		types.push("@types/node")
	} else if (targetsWebDirectly(target)) {
		types.push("@types/web")
	} else if (targetsNode(target) && targetsWeb(target)) {
		types.push("@types/node")

		lib.push("dom")
		lib.push("dom.iterable")
	}

	if (targetsReact(target)) {
		types.push("@types/react")
		types.push("@types/react-dom")
	}

	return {types, lib}
}
