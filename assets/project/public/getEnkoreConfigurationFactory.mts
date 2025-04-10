import type {ProjectAPI} from "#~src/project/ProjectAPI.d.mts"
import type {ProjectAPIContext} from "#~src/project/ProjectAPIContext.d.mts"

const impl: ProjectAPI["getEnkoreConfiguration"] = function(
	this: ProjectAPIContext
) {
	return JSON.parse(JSON.stringify(this.projectConfig))
}

export function getEnkoreConfigurationFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
