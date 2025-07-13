import type {ProjectAPIContext} from "./ProjectAPIContext.ts"
import {_parseEmbedURLRemoveMeAfterUpdate} from "./_parseEmbedURLRemoveMeAfterUpdate.ts"

export function translateEmbedURLToGlobalIdentifier(
	context: ProjectAPIContext,
	embedURL: string
): string {
	const {name, version} = context.projectPackageJSON
	const {protocol, path} = _parseEmbedURLRemoveMeAfterUpdate(embedURL)

	return `${name}/v${version}/${protocol}/${path}`
}
