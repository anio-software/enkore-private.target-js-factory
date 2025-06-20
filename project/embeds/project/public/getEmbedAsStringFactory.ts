import type {ProjectAPI} from "../ProjectAPI.ts"
import type {ProjectAPIContext} from "../ProjectAPIContext.ts"
import {getEmbedData} from "../getEmbedData.ts"

const impl: ProjectAPI["getEmbedAsString"] = function(
	this: ProjectAPIContext, embedPath: string
) {
	return (new TextDecoder).decode(getEmbedData(this, embedPath))
}

export function getEmbedAsStringFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
