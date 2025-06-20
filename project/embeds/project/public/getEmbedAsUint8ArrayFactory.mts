import type {ProjectAPI} from "../ProjectAPI.mts"
import type {ProjectAPIContext} from "../ProjectAPIContext.mts"
import {getEmbedData} from "../getEmbedData.mts"

const impl: ProjectAPI["getEmbedAsUint8Array"] = function(
	this: ProjectAPIContext, embedPath: string
) {
	return getEmbedData(this, embedPath)
}

export function getEmbedAsUint8ArrayFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
