import type {ProjectAPI} from "#~src/runtime/ProjectAPI.d.mts"
import type {ProjectAPIContext} from "#~src/runtime/ProjectAPIContext.d.mts"

const impl: ProjectAPI["getEnkoreConfiguration"] = function(
	this: ProjectAPIContext
) {
	return JSON.parse(JSON.stringify(this.projectConfig))
}

export function getEnkoreConfigurationFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
