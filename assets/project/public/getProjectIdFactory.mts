import type {ProjectAPI} from "../ProjectAPI.mts"
import type {ProjectAPIContext} from "../ProjectAPIContext.mts"

const impl: ProjectAPI["getProjectId"] = function(
	this: ProjectAPIContext
) {
	return this.projectId
}

export function getProjectIdFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
