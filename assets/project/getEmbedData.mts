import type {ProjectAPIContext, ProjectEmbedFile} from "./ProjectAPIContext.mts"
import type {EnkoreJSRuntimeGlobalData} from "@enkore/spec"

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

		if (!(globalEmbedId in globalData[0].embeds)) {
			throw new Error(
				`Unable to locate '${globalEmbedId}' in the global embed map. This is a bug.`
			)
		}

		embedData = globalData[0].embeds[globalEmbedId].data
	}

	// from https://web.dev/articles/base64-encoding
	const binString = globalThis.atob(embedData)

	return Uint8Array.from(binString, (m) => m.codePointAt(0)!)
}
