import type {ProjectAPI} from "../ProjectAPI.ts"
import type {ProjectAPIContext} from "../ProjectAPIContext.ts"

const impl: ProjectAPI["getProjectPackageJSON"] = function(
	this: ProjectAPIContext
) {
	return JSON.parse(JSON.stringify(this.projectPackageJSON))
}

export function getProjectPackageJSONFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
