import type {RuntimeAPI} from "#~src/runtime/RuntimeAPI.d.mts"
import type {RuntimeAPIContext} from "#~src/runtime/RuntimeAPIContext.d.mts"
import {createRuntimeContext} from "#~src/runtime/createRuntimeContext.mts"

const impl: RuntimeAPI["createContext"] = function(
	this: RuntimeAPIContext, ctxOrOptions
) {
	if (ctxOrOptions === undefined) {
		return createRuntimeContext(this, undefined)
	} else if (ctxOrOptions.entityKind === "EnkoreJSRuntimeContext") {
		return ctxOrOptions
	} else {
		return createRuntimeContext(this, ctxOrOptions)
	}
}

export function createContextFactory(context: RuntimeAPIContext) {
	return impl!.bind(context)
}
