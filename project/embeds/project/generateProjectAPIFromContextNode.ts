import type {ProjectAPIContext} from "./ProjectAPIContext.ts"
import type {ProjectAPI} from "./ProjectAPI.ts"
import {_generateProjectAPIFromContextPartial} from "./_generateProjectAPIFromContextPartial.ts"
import {getEmbedAsURLNodeFactory} from "./getEmbedAsURLNodeFactory.ts"

export async function generateProjectAPIFromContextNode(
	context: ProjectAPIContext
): Promise<ProjectAPI> {
	return {
		...await _generateProjectAPIFromContextPartial(context),
		getEmbedAsURL: getEmbedAsURLNodeFactory(context)
	}
}
