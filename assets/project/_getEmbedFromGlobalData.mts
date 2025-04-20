import type {ProjectAPIContext, ProjectEmbedFile} from "./ProjectAPIContext.mts"
import {translateEmbedPathToGlobalEmbedID} from "./translateEmbedPathToGlobalEmbedID.mts"
import {_getGlobalRuntimeData} from "./_getGlobalRuntimeData.mts"

//
// this function should only be called within a bundle context
//
export function _getEmbedFromGlobalData(
	context: ProjectAPIContext,
	embedPath: string
): ProjectEmbedFile {
	const globalEmbedId = translateEmbedPathToGlobalEmbedID(context, embedPath)
	const globalData = _getGlobalRuntimeData()

	if (!(globalEmbedId in globalData.immutable.embeds)) {
		throw new Error(
			`Unable to locate '${globalEmbedId}' in the global embed map. This is a bug.`
		)
	}

	return globalData.immutable.embeds[globalEmbedId]
}
