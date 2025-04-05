import type {RuntimeAPI} from "#~src/runtime/RuntimeAPI.d.mts"
import type {RuntimeAPIContext} from "#~src/runtime/RuntimeAPIContext.d.mts"

const impl: RuntimeAPI["getProject"] = function(
	this: RuntimeAPIContext
) {
	return {} as any
}

export function getProjectFactory(context: RuntimeAPIContext) {
	return impl!.bind(context)
}
