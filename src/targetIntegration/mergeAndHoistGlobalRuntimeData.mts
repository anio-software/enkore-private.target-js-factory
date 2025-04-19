import {
	type EnkoreSessionAPI,
	type EnkoreJSRuntimeGlobalEmbed,
	isEntityOfKind,
	createEntity
} from "@enkore/spec"
import {getTargetDependency} from "./getTargetDependency.mts"

export function mergeAndHoistGlobalRuntimeData(
	session: EnkoreSessionAPI,
	code: string
): string {
	const babel = getTargetDependency(session, "@enkore/babel")
	let newGlobalEmbeds: Record<string, EnkoreJSRuntimeGlobalEmbed> = {}

	const {
		code: newCode,
		globalData
	} = babel.removeEnkoreJSRuntimeArtifactsFromCode(
		code
	)

	for (const entry of globalData) {
		if (!isEntityOfKind(entry, "EnkoreJSRuntimeGlobalData")) {
			continue
		}

		for (const id in entry.immutable.embeds) {
			newGlobalEmbeds[id] = entry.immutable.embeds[id]
		}
	}

	const newGlobalData = createEntity("EnkoreJSRuntimeGlobalData", 0, 0, {
		immutable: {
			embeds: newGlobalEmbeds
		},
		// will be populated / used at runtime
		mutable: {
			embedResourceURLs: {}
		}
	})

	return babel.defineEnkoreJSRuntimeGlobalData(
		newGlobalData
	) + newCode
}
