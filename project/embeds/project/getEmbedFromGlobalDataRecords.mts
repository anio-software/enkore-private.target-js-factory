import type {EnkoreJSRuntimeEmbeddedFile} from "@anio-software/enkore-private.spec"
import type {ProjectAPIContext} from "./ProjectAPIContext.mts"
import {translateEmbedPathToGlobalEmbedID} from "./translateEmbedPathToGlobalEmbedID.mts"
import {getGlobalRuntimeDataRecords} from "./getGlobalRuntimeDataRecords.mts"

export function getEmbedFromGlobalDataRecords(
	context: ProjectAPIContext,
	embedPath: string
): EnkoreJSRuntimeEmbeddedFile {
	const globalEmbedId = translateEmbedPathToGlobalEmbedID(context, embedPath)
	const records = getGlobalRuntimeDataRecords()

	for (const record of records) {
		if (globalEmbedId in record.immutable.embeds) {
			return record.immutable.embeds[globalEmbedId]
		}
	}

	throw new Error(
		`Unable to locate '${globalEmbedId}' in the global data records. This is a bug.`
	)
}
