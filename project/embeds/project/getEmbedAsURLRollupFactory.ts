import type {ProjectAPI} from "./ProjectAPI.ts"
import type {ProjectAPIContext} from "./ProjectAPIContext.ts"
import {translateEmbedURLToGlobalIdentifier} from "./translateEmbedURLToGlobalIdentifier.ts"
import {getGlobalState} from "./getGlobalState.ts"

const impl: ProjectAPI["getEmbedAsURL"] = function(
	this: ProjectAPIContext, embedPath: string
) {
	// node runtime branch
	if (this._projectEmbedFileMapRemoveMeInBundle) {
		throw new Error(`We should never get here. This is a bug.`)
	}

	const globalIdentifier = translateEmbedURLToGlobalIdentifier(this, embedPath)
	const globalState = getGlobalState()

	if (!globalState.mutable.embedResourceURLs.has(globalIdentifier)) {
		throw new Error(
			`Unable to locate resource URL for embed '${globalIdentifier}'.`
		)
	}

	return globalState.mutable.embedResourceURLs.get(globalIdentifier)!
}

export function getEmbedAsURLRollupFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
