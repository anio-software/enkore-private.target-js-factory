import type {EntryPoint} from "./InternalData.d.mts"

export function entryPointHasCSSExports(entryPoint: EntryPoint) {
	for (const [exportName, meta] of entryPoint.exports.entries()) {
		if (meta.cssImportMap.size) {
			return true
		}
	}

	return false
}
