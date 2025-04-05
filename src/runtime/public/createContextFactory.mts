import type {RuntimeAPI} from "#~src/runtime/RuntimeAPI.d.mts"
import type {RuntimeAPIContext} from "#~src/runtime/RuntimeAPIContext.d.mts"

const impl: RuntimeAPI["createContext"] = function(
	this: RuntimeAPIContext, ctxOrOptions
) {
	return {} as any
}

export function createContextFactory(context: RuntimeAPIContext) {
	return impl!.bind(context)
}
