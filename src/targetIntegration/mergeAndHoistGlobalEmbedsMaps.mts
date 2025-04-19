import type {EnkoreSessionAPI} from "@enkore/spec"
import {getTargetDependency} from "./getTargetDependency.mts"
import {getGlobalEmbedInitCode} from "./getGlobalEmbedInitCode.mts"

export function mergeAndHoistGlobalEmbedsMaps(
	session: EnkoreSessionAPI,
	code: string
): string {
	const babel = getTargetDependency(session, "@enkore/babel")
	let newMap: Record<string, unknown> = {}

	const {
		code: newCode,
		globalProjectEmbedMaps
	} = babel.getAndRemoveEnkoreJSRuntimeGlobalProjectEmbedMapsStringFromCode(
		"@enkore/target-js/globalEmbedsMap",
		"__initEnkoreJSRuntimeGlobalProjectEmbedMap",
		code
	)

	for (const str of globalProjectEmbedMaps) {
		const map = JSON.parse(str)

		newMap = {...newMap, ...map}
	}

	return getGlobalEmbedInitCode(newMap) + newCode
}
