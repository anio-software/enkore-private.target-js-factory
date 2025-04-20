import type {ProjectAPI} from "./ProjectAPI.mts"
import type {ProjectAPIContext} from "./ProjectAPIContext.mts"

const impl: ProjectAPI["getEmbedAsURL"] = function(
	this: ProjectAPIContext, embedPath: string
) {
	// rollup runtime branch
	if (!this._projectEmbedFileMapRemoveMeInBundle) {
		throw new Error(`We should never get here. This is a bug.`)
	}

	return "node-impl"
}

export function getEmbedAsURLNodeFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
