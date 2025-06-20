import type {ProjectAPI} from "../ProjectAPI.mts"
import type {ProjectAPIContext} from "../ProjectAPIContext.mts"
import {getEmbedData} from "../getEmbedData.mts"

const impl: ProjectAPI["getEmbedAsString"] = function(
	this: ProjectAPIContext, embedPath: string
) {
	return (new TextDecoder).decode(getEmbedData(this, embedPath))
}

export function getEmbedAsStringFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
