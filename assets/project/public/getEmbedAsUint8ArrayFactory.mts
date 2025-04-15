import type {ProjectAPI} from "../ProjectAPI.mts"
import type {ProjectAPIContext} from "../ProjectAPIContext.mts"
import {getEmbedData} from "../getEmbedData.mts"

const impl: ProjectAPI["getEmbedAsUint8Array"] = function(
	this: ProjectAPIContext, embedPath: string
) {
	// from https://web.dev/articles/base64-encoding
	const binString = globalThis.atob(getEmbedData(this, embedPath))

	return Uint8Array.from(binString, (m) => m.codePointAt(0)!)
}

export function getEmbedAsUint8ArrayFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
