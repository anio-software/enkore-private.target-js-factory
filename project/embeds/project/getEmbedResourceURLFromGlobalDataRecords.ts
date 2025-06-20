import type {ProjectAPIContext} from "./ProjectAPIContext.ts"
import {translateEmbedPathToGlobalEmbedID} from "./translateEmbedPathToGlobalEmbedID.ts"
import {getGlobalRuntimeDataRecords} from "./getGlobalRuntimeDataRecords.ts"

export function getEmbedResourceURLFromGlobalDataRecords(
	context: ProjectAPIContext,
	embedPath: string
): string {
	const globalEmbedId = translateEmbedPathToGlobalEmbedID(context, embedPath)
	const records = getGlobalRuntimeDataRecords()

	for (const record of records) {
		if (globalEmbedId in record.mutable.embedResourceURLs) {
			return record.mutable.embedResourceURLs[globalEmbedId]
		}
	}

	throw new Error(
		`Unable to locate resource URL for embed '${globalEmbedId}' in the global data records. This is a bug.`
	)
}
