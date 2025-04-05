import type {RuntimeAPI} from "#~src/runtime/RuntimeAPI.d.mts"
import type {RuntimeAPIContext} from "#~src/runtime/RuntimeAPIContext.d.mts"

const impl: RuntimeAPI["getEnkoreConfiguration"] = function(
	this: RuntimeAPIContext
) {
	return JSON.parse(JSON.stringify(this.projectConfig))
}

export function getEnkoreConfigurationFactory(context: RuntimeAPIContext) {
	return impl!.bind(context)
}
