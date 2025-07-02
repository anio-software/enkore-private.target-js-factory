import type {ProjectAPI} from "../ProjectAPI.ts"
import type {ProjectAPIContext} from "../ProjectAPIContext.ts"
import {getEmbedData} from "../getEmbedData.ts"

const impl: ProjectAPI["getEmbedAsUint8Array"] = function(
	this: ProjectAPIContext, embedPath: string
) {
	return getEmbedData(this, embedPath)
}

export function getEmbedAsUint8ArrayFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
