import type {RuntimeAPI} from "#~src/runtime/RuntimeAPI.d.mts"
import type {RuntimeAPIContext} from "#~src/runtime/RuntimeAPIContext.d.mts"

const impl: RuntimeAPI["getEmbedAsUint8Array"] = function(
	this: RuntimeAPIContext, embedPath: string
) {
	return new Uint8Array()
}

export function getEmbedAsUint8ArrayFactory(context: RuntimeAPIContext) {
	return impl!.bind(context)
}
