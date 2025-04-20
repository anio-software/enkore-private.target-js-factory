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

		// quick hack
		if (!entry.immutable) continue

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

	let ret = ``

	ret += babel.defineEnkoreJSRuntimeGlobalData(
		newGlobalData
	)

	ret += babel.defineEnkoreJSRuntimeGlobalInitFunction(`runtimeData`, `
		for (const embedId in runtimeData.immutable.embeds) {
			const embed = runtimeData.immutable.embeds[embedId]

			if (embed._createResourceAtRuntimeInit !== true) continue
			if (embedId in runtimeData.mutable.embedResourceURLs) {
				continue
			}

			runtimeData.mutable.embedResourceURLs[embedId] = "something"
		}
`)
	ret += babel.invokeEnkoreJSRuntimeGlobalInitFunction()
	ret += newCode

	return ret
}
