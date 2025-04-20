import type {EnkoreJSRuntimeGlobalData} from "@enkore/spec"

//
// this function should only be called within a bundle context
//
export function getGlobalRuntimeData(): EnkoreJSRuntimeGlobalData {
	const globalThisPropKey = Symbol.for("@enkore/target-js-factory/globalData")

	if (!(globalThisPropKey in globalThis)) {
		throw new Error(`globalThis[Symbol.for("@enkore/target-js-factory/globalData")] is not set. This is a bug.`)
	}

	const globalData = (
		(globalThis as any)[globalThisPropKey]
	) as EnkoreJSRuntimeGlobalData[]

	if (globalData.length !== 1) {
		throw new Error(`globalData.length is ${globalData.length}. This is a bug.`)
	}

	return globalData[0]
}
