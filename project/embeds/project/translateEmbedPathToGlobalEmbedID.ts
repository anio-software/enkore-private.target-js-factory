import type {ProjectAPIContext} from "./ProjectAPIContext.ts"

export function translateEmbedPathToGlobalEmbedID(
	context: ProjectAPIContext,
	embedPath: string
): string {
	// get the global embed id
	if (!(embedPath in context.projectEmbedFileTranslationMap)) {
		throw new Error(
			`Don't know how to translate local embed path '${embedPath}' to global identifier.`
		)
	}

	return context.projectEmbedFileTranslationMap[embedPath]
}
