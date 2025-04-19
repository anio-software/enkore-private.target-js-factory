import type {ProjectAPIContext, ProjectEmbedFile} from "./ProjectAPIContext.mts"

type GlobalEmbedsMap = Record<string, ProjectEmbedFile>

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
		// get the global embed id
		if (!(url in context.projectEmbedFileTranslationMap)) {
			throw new Error(
				`Don't know how to translate local embed path '${url}' to global identifier.`
			)
		}

		const globalEmbedId = context.projectEmbedFileTranslationMap[url]
		const globalThisPropKey = Symbol.for("@enkore/target-js/globalEmbedsMap")

		if (!(globalThisPropKey in globalThis)) {
			throw new Error(`globalThis[Symbol.for("@enkore/target-js/globalEmbedsMap")] is not set. This is a bug.`)
		}

		const globalEmbedsMap = (
			(globalThis as any)[globalThisPropKey]
		) as GlobalEmbedsMap

		if (!(globalEmbedId in globalEmbedsMap)) {
			throw new Error(
				`Unable to locate '${globalEmbedId}' in the global embed map. This is a bug.`
			)
		}

		embedData = globalEmbedsMap[globalEmbedId].data
	}

	// from https://web.dev/articles/base64-encoding
	const binString = globalThis.atob(embedData)

	return Uint8Array.from(binString, (m) => m.codePointAt(0)!)
}
