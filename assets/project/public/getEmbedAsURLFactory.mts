import type {ProjectAPI} from "../ProjectAPI.mts"
import type {ProjectAPIContext} from "../ProjectAPIContext.mts"
import {getEmbedResourceURL} from "../getEmbedResourceURL.mts"

const impl: ProjectAPI["getEmbedAsURL"] = function(
	this: ProjectAPIContext, embedPath: string
) {
	return getEmbedResourceURL(this, embedPath)
}

export function getEmbedAsURLFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
