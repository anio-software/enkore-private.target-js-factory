import type {ProjectAPI} from "../ProjectAPI.ts"
import type {ProjectAPIContext} from "../ProjectAPIContext.ts"

const impl: ProjectAPI["getEnkoreConfiguration"] = function(
	this: ProjectAPIContext
) {
	return JSON.parse(JSON.stringify(this.projectConfig))
}

export function getEnkoreConfigurationFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
