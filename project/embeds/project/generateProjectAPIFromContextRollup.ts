import type {ProjectAPIContext} from "./ProjectAPIContext.ts"
import type {ProjectAPI} from "./ProjectAPI.ts"
import {_generateProjectAPIFromContextPartial} from "./_generateProjectAPIFromContextPartial.ts"
import {getEmbedAsURLRollupFactory} from "./getEmbedAsURLRollupFactory.ts"

export function generateProjectAPIFromContextRollup(
	context: ProjectAPIContext
): ProjectAPI {
	return {
		..._generateProjectAPIFromContextPartial(context),
		getEmbedAsURL: getEmbedAsURLRollupFactory(context)
	}
}
