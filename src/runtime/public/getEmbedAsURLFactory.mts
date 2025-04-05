import type {RuntimeAPI} from "#~src/runtime/RuntimeAPI.d.mts"
import type {RuntimeAPIContext} from "#~src/runtime/RuntimeAPIContext.d.mts"

const impl: RuntimeAPI["getEmbedAsURL"] = function(
	this: RuntimeAPIContext, embedPath: string
) {
	return ""
}

export function getEmbedAsURLFactory(context: RuntimeAPIContext) {
	return impl!.bind(context)
}
