import type {ProjectAPI} from "./ProjectAPI.mts"
import type {ProjectAPIContext} from "./ProjectAPIContext.mts"
import {translateEmbedPathToGlobalEmbedID} from "./translateEmbedPathToGlobalEmbedID.mts"
import {getGlobalRuntimeDataRecords} from "./getGlobalRuntimeDataRecords.mts"

const impl: ProjectAPI["getEmbedAsURL"] = function(
	this: ProjectAPIContext, embedPath: string
) {
	// node runtime branch
	if (this._projectEmbedFileMapRemoveMeInBundle) {
		throw new Error(`We should never get here. This is a bug.`)
	}

	const globalEmbedId = translateEmbedPathToGlobalEmbedID(this, embedPath)
	const globalData = getGlobalRuntimeData()

	if (!(globalEmbedId in globalData.mutable.embedResourceURLs)) {
		throw new Error(
			`Embed with id '${globalEmbedId} is missing from globalData.mutable.embedResourceURLs. This is a bug.'`
		)
	}

	const resourceURL = globalData.mutable.embedResourceURLs[globalEmbedId]

	if (!resourceURL.length) {
		throw new Error(
			`Embed with id '${globalEmbedId}' doesn't have a resource associated with it. This is a bug.`
		)
	}

	return resourceURL
}

export function getEmbedAsURLRollupFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
