import type {ProjectAPIContext} from "./ProjectAPIContext.mts"
import {_getGlobalRuntimeData} from "./_getGlobalRuntimeData.mts"

export function getEmbedData(
	context: ProjectAPIContext,
	url: string
): Uint8Array {
	let embedData = ``

	//
	// node runtime branch
	//
	if (context._projectEmbedFileMapRemoveMeInBundle) {
		const map = context._projectEmbedFileMapRemoveMeInBundle

		if (!map.has(url)) {
			throw new Error(
				`No embed at URL '${url}'.`
			)
		}

		embedData = map.get(url)!.data
	}
	// bundle branch
	else {
		// get the global embed id
		if (!(url in context.projectEmbedFileTranslationMap)) {
			throw new Error(
				`Don't know how to translate local embed path '${url}' to global identifier.`
			)
		}

		const globalEmbedId = context.projectEmbedFileTranslationMap[url]

		const globalData = _getGlobalRuntimeData()

		if (!(globalEmbedId in globalData.immutable.embeds)) {
			throw new Error(
				`Unable to locate '${globalEmbedId}' in the global embed map. This is a bug.`
			)
		}

		embedData = globalData.immutable.embeds[globalEmbedId].data
	}

	// from https://web.dev/articles/base64-encoding
	const binString = globalThis.atob(embedData)

	return Uint8Array.from(binString, (m) => m.codePointAt(0)!)
}
