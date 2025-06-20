import type {ProjectAPI} from "../ProjectAPI.mts"
import type {ProjectAPIContext} from "../ProjectAPIContext.mts"

const impl: ProjectAPI["getProject"] = function(
	this: ProjectAPIContext
) {
	return this.project
}

export function getProjectFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
