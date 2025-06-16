import type {InternalData} from "./InternalData.d.mts"

type MapValueType<A> = A extends Map<any, infer V> ? V : never;
type EntryPoint = MapValueType<InternalData["entryPointMap"]>

export function entryPointHasCSSExports(entryPoint: EntryPoint) {
	for (const [exportName, meta] of entryPoint.entries()) {
		if (meta.cssImportMap.size) {
			return true
		}
	}

	return false
}
