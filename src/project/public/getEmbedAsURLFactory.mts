import type {ProjectAPI} from "#~src/project/ProjectAPI.d.mts"
import type {ProjectAPIContext} from "#~src/project/ProjectAPIContext.d.mts"

const impl: ProjectAPI["getEmbedAsURL"] = function(
	this: ProjectAPIContext, embedPath: string
) {
	return ""
}

export function getEmbedAsURLFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
