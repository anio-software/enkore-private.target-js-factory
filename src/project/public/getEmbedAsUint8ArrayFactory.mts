import type {ProjectAPI} from "#~src/project/ProjectAPI.d.mts"
import type {ProjectAPIContext} from "#~src/project/ProjectAPIContext.d.mts"

const impl: ProjectAPI["getEmbedAsUint8Array"] = function(
	this: ProjectAPIContext, embedPath: string
) {
	return new Uint8Array()
}

export function getEmbedAsUint8ArrayFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
