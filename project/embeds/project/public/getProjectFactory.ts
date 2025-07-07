import type {ProjectAPI} from "../ProjectAPI.ts"
import type {ProjectAPIContext} from "../ProjectAPIContext.ts"

const impl: ProjectAPI["getProject"] = function(
	this: ProjectAPIContext
) {
	return this.project
}

export function getProjectFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
