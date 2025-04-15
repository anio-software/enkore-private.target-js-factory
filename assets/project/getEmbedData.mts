import type {ProjectAPIContext} from "./ProjectAPIContext.mts"

export function getEmbedData(
	context: ProjectAPIContext,
	url: string
): Uint8Array {
	if (!context.projectEmbedFileMap.hasOwnProperty(url)) {
		throw new Error(
			`No embed at URL '${url}'.`
		)
	}

	// from https://web.dev/articles/base64-encoding
	const binString = globalThis.atob(context.projectEmbedFileMap[url].data)

	return Uint8Array.from(binString, (m) => m.codePointAt(0)!)
}
