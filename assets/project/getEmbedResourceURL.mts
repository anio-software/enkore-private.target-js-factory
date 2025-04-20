import type {ProjectAPIContext} from "./ProjectAPIContext.mts"
import {_getGlobalRuntimeData} from "./_getGlobalRuntimeData.mts"
import {_translateEmbedPath} from "./_translateEmbedPath.mts"

export function getEmbedResourceURL(
	context: ProjectAPIContext,
	url: string
) {
	//
	// node runtime branch
	//
	if (context._projectEmbedFileMapRemoveMeInBundle) {
		throw new Error(`not implemented (yet).`)
	} else {
		const globalEmbedId = _translateEmbedPath(context, url)
		const globalData = _getGlobalRuntimeData()

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
}
