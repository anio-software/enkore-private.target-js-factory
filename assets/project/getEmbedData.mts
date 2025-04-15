import type {ProjectAPIContext} from "./ProjectAPIContext.mts"

export function getEmbedData(
	context: ProjectAPIContext,
	url: string
): string {
	if (!context.projectEmbedFileMap.hasOwnProperty(url)) {
		throw new Error(
			`No embed at URL '${url}'.`
		)
	}

	return context.projectEmbedFileMap[url].data
}
