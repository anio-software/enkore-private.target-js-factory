import type {ProjectAPIContext} from "./ProjectAPIContext.d.mts"
import type {ProjectAPI} from "./ProjectAPI.mts"
import {_generateProjectAPIFromContextPartial} from "./_generateProjectAPIFromContextPartial.mts"
import {getEmbedAsURLRollupFactory} from "./getEmbedAsURLRollupFactory.mts"

export async function generateProjectAPIFromContextRollup(
	context: ProjectAPIContext
): Promise<ProjectAPI> {
	return {
		...await _generateProjectAPIFromContextPartial(context),
		getEmbedAsURL: getEmbedAsURLRollupFactory(context)
	}
}
