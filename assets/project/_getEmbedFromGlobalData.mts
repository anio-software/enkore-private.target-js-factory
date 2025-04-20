import type {ProjectAPIContext, ProjectEmbedFile} from "./ProjectAPIContext.mts"
import {_getGlobalRuntimeData} from "./_getGlobalRuntimeData.mts"

//
// this function should only be called within a bundle context
//
export function _getEmbedFromGlobalData(
	context: ProjectAPIContext,
	embedPath: string
): ProjectEmbedFile {
	// get the global embed id
	if (!(embedPath in context.projectEmbedFileTranslationMap)) {
		throw new Error(
			`Don't know how to translate local embed path '${embedPath}' to global identifier.`
		)
	}

	const globalEmbedId = context.projectEmbedFileTranslationMap[embedPath]

	const globalData = _getGlobalRuntimeData()

	if (!(globalEmbedId in globalData.immutable.embeds)) {
		throw new Error(
			`Unable to locate '${globalEmbedId}' in the global embed map. This is a bug.`
		)
	}

	return globalData.immutable.embeds[globalEmbedId]
}
