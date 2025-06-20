import type {ProjectAPI} from "../ProjectAPI.ts"
import type {ProjectAPIContext} from "../ProjectAPIContext.ts"

const impl: ProjectAPI["getProjectId"] = function(
	this: ProjectAPIContext
) {
	return this.projectId
}

export function getProjectIdFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
