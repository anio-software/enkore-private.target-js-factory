import type {ProjectAPI} from "#~src/project/ProjectAPI.d.mts"
import type {ProjectAPIContext} from "#~src/project/ProjectAPIContext.d.mts"

const impl: ProjectAPI["getProjectPackageJSON"] = function(
	this: ProjectAPIContext
) {
	return JSON.parse(JSON.stringify(this.projectPackageJSON))
}

export function getProjectPackageJSONFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
