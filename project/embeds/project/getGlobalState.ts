import type {EnkoreJSRuntimeGlobalState} from "@anio-software/enkore-private.spec"
import {globalStateSymbolForIdentifier} from "./globalStateSymbolForIdentifier.ts"

export function getGlobalState(): EnkoreJSRuntimeGlobalState {
	const symbol = Symbol.for(globalStateSymbolForIdentifier)

	if (!(symbol in globalThis)) {
		throw new Error(`Unable to find enkore js runtime global state.`)
	}

	return (globalThis as any)[symbol] as EnkoreJSRuntimeGlobalState
}
