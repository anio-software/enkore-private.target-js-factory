import type {RuntimeAPI} from "#~src/runtime/RuntimeAPI.d.mts"
import type {RuntimeAPIContext} from "#~src/runtime/RuntimeAPIContext.d.mts"

const impl: RuntimeAPI["getProjectPackageJSON"] = function(
	this: RuntimeAPIContext
) {
	return JSON.parse(JSON.stringify(this.projectPackageJSON))
}

export function getProjectPackageJSONFactory(context: RuntimeAPIContext) {
	return impl!.bind(context)
}
