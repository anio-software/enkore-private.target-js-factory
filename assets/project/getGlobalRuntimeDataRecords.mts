import type {EnkoreJSRuntimeGlobalDataRecord} from "@anio-software/enkore.spec"

export function getGlobalRuntimeDataRecords(): EnkoreJSRuntimeGlobalDataRecord[] {
	const globalThisPropKey = Symbol.for("@enkore/js-runtime/globalRecords")

	if (!(globalThisPropKey in globalThis)) {
		throw new Error(`globalThis[Symbol.for("@enkore/js-runtime/globalRecords")] is not set. This is a bug.`)
	}

	const records = (
		(globalThis as any)[globalThisPropKey]
	) as EnkoreJSRuntimeGlobalDataRecord[]

	return records
}
