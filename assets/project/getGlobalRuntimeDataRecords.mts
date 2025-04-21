import type {EnkoreJSRuntimeGlobalDataRecord} from "@enkore/spec"

//
// this function should only be called within a bundle context
//
export function getGlobalRuntimeDataRecords(): EnkoreJSRuntimeGlobalDataRecord[] {
	const globalThisPropKey = Symbol.for("@enkore/target-js-factory/globalData")

	if (!(globalThisPropKey in globalThis)) {
		throw new Error(`globalThis[Symbol.for("@enkore/target-js-factory/globalData")] is not set. This is a bug.`)
	}

	const records = (
		(globalThis as any)[globalThisPropKey]
	) as EnkoreJSRuntimeGlobalDataRecord[]

	return records
}
