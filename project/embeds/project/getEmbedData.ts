import type {ProjectAPIContext} from "./ProjectAPIContext.ts"
import {translateEmbedURLToGlobalIdentifier} from "./translateEmbedURLToGlobalIdentifier.ts"
import {getGlobalState} from "./getGlobalState.ts"

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
		const globalIdentifier = translateEmbedURLToGlobalIdentifier(context, url)
		const globalState = getGlobalState()

		if (!globalState.immutable.embeds.has(globalIdentifier)) {
			throw new Error(
				`Unable to locate data for embed '${globalIdentifier}'.`
			)
		}

		embedData = globalState.immutable.embeds.get(globalIdentifier)!.data
	}

	// from https://web.dev/articles/base64-encoding
	const binString = globalThis.atob(embedData)

	return Uint8Array.from(binString, (m) => m.codePointAt(0)!)
}
