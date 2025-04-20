import type {ProjectAPI} from "./ProjectAPI.mts"
import type {ProjectAPIContext} from "./ProjectAPIContext.mts"

const impl: ProjectAPI["getEmbedAsURL"] = function(
	this: ProjectAPIContext, embedPath: string
) {
	return "node-impl"
}

export function getEmbedAsURLNodeFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
