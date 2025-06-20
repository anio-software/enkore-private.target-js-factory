import type {ProjectAPI} from "./ProjectAPI.ts"
import type {ProjectAPIContext} from "./ProjectAPIContext.ts"
import {getEmbedResourceURLFromGlobalDataRecords} from "./getEmbedResourceURLFromGlobalDataRecords.ts"

const impl: ProjectAPI["getEmbedAsURL"] = function(
	this: ProjectAPIContext, embedPath: string
) {
	// node runtime branch
	if (this._projectEmbedFileMapRemoveMeInBundle) {
		throw new Error(`We should never get here. This is a bug.`)
	}

	const resourceURL = getEmbedResourceURLFromGlobalDataRecords(this, embedPath)

	if (!resourceURL.length) {
		throw new Error(
			`Embed '${embedPath}' doesn't have a resource associated with it. This is a bug.`
		)
	}

	return resourceURL
}

export function getEmbedAsURLRollupFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
