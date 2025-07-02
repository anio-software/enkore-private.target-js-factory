import type {ProjectAPI} from "../ProjectAPI.ts"
import type {ProjectAPIContext} from "../ProjectAPIContext.ts"

const impl: ProjectAPI["getEmbedAsURL"] = function(
	this: ProjectAPIContext, embedPath: string
) {
	throw new Error(
		`This function is a stub and should never be callable by a user.` +
		` If you encounter this, this is definitely a bug.`
	)
}

export function getEmbedAsURLFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
