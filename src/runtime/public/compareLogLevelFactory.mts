import type {RuntimeAPI} from "#~src/runtime/RuntimeAPI.d.mts"
import type {RuntimeAPIContext} from "#~src/runtime/RuntimeAPIContext.d.mts"

const impl: RuntimeAPI["compareLogLevel"] = function(
	this: RuntimeAPIContext, left, operator, right
) {
	return false
}

export function compareLogLevelFactory(context: RuntimeAPIContext) {
	return impl!.bind(context)
}
