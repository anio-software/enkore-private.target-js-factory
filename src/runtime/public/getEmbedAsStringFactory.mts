import type {ProjectAPI} from "#~src/runtime/ProjectAPI.d.mts"
import type {ProjectAPIContext} from "#~src/runtime/ProjectAPIContext.d.mts"

const impl: ProjectAPI["getEmbedAsString"] = function(
	this: ProjectAPIContext, embedPath: string
) {
	return ""
}

export function getEmbedAsStringFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
