import {
	type EnkoreSessionAPI,
	type EnkoreJSRuntimeGlobalEmbed,
	isEntityOfKind,
	createEntity
} from "@enkore/spec"
import {getTargetDependency} from "./getTargetDependency.mts"
import {getGlobalRuntimeDataInitCode} from "./getGlobalRuntimeDataInitCode.mts"

export function mergeAndHoistGlobalRuntimeData(
	session: EnkoreSessionAPI,
	code: string
): string {
	const babel = getTargetDependency(session, "@enkore/babel")
	let newGlobalEmbeds: Record<string, EnkoreJSRuntimeGlobalEmbed> = {}

	const {
		code: newCode,
		globalData
	} = babel.getAndRemoveEnkoreJSRuntimeGlobalDataStringFromCode(
		code
	)

	for (const entry of globalData) {
		if (!isEntityOfKind(entry, "EnkoreJSRuntimeGlobalData")) {
			continue
		}

		for (const id in entry.embeds) {
			newGlobalEmbeds[id] = entry.embeds[id]
		}
	}

	const newGlobalData = createEntity("EnkoreJSRuntimeGlobalData", 0, 0, {
		embeds: newGlobalEmbeds
	})

	return getGlobalRuntimeDataInitCode(session, newGlobalData) + newCode
}
