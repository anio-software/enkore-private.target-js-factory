import type {ProjectAPI} from "#~src/runtime/ProjectAPI.d.mts"
import type {ProjectAPIContext} from "#~src/runtime/ProjectAPIContext.d.mts"

const impl: ProjectAPI["getProjectPackageJSON"] = function(
	this: ProjectAPIContext
) {
	return JSON.parse(JSON.stringify(this.projectPackageJSON))
}

export function getProjectPackageJSONFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
