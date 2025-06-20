import type {ProjectAPIContext} from "./ProjectAPIContext.mts"
import {getEmbedFromGlobalDataRecords} from "./getEmbedFromGlobalDataRecords.mts"

export function getEmbedData(
	context: ProjectAPIContext,
	url: string
): Uint8Array {
	let embedData = ``

	//
	// node runtime branch
	//
	if (context._projectEmbedFileMapRemoveMeInBundle) {
		const map = context._projectEmbedFileMapRemoveMeInBundle

		if (!map.has(url)) {
			throw new Error(
				`No embed at URL '${url}'.`
			)
		}

		embedData = map.get(url)!.data
	}
	// bundle branch
	else {
		embedData = getEmbedFromGlobalDataRecords(context, url).data
	}

	// from https://web.dev/articles/base64-encoding
	const binString = globalThis.atob(embedData)

	return Uint8Array.from(binString, (m) => m.codePointAt(0)!)
}
