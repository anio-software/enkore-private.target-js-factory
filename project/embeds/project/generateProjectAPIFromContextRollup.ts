import type {ProjectAPIContext} from "./ProjectAPIContext.ts"
import type {ProjectAPI} from "./ProjectAPI.ts"
import {_generateProjectAPIFromContextPartial} from "./_generateProjectAPIFromContextPartial.ts"
import {getEmbedAsURLRollupFactory} from "./getEmbedAsURLRollupFactory.ts"

export async function generateProjectAPIFromContextRollup(
	context: ProjectAPIContext
): Promise<ProjectAPI> {
	return {
		...await _generateProjectAPIFromContextPartial(context),
		getEmbedAsURL: getEmbedAsURLRollupFactory(context)
	}
}
