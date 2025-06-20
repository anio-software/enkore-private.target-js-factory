import type {ProjectAPI} from "../ProjectAPI.mts"
import type {ProjectAPIContext} from "../ProjectAPIContext.mts"

const impl: ProjectAPI["getEnkoreConfiguration"] = function(
	this: ProjectAPIContext
) {
	return JSON.parse(JSON.stringify(this.projectConfig))
}

export function getEnkoreConfigurationFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
