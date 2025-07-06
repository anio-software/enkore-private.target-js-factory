import type {ProjectAPI} from "./ProjectAPI.ts"
import type {ProjectAPIContext} from "./ProjectAPIContext.ts"
import {getEmbedData} from "./getEmbedData.ts"
import {_getCreationOptionsForEmbed} from "./_getCreationOptionsForEmbed.ts"
import {createTemporaryResourceFromStringSyncFactory} from "@anio-software/pkg.temporary-resource-factory"
import {createRequire} from "node:module"

const createTemporaryResourceFromStringSync = createTemporaryResourceFromStringSyncFactory(
	createRequire("/")
)

const impl: ProjectAPI["getEmbedAsURL"] = function(
	this: ProjectAPIContext, embedPath: string
) {
	// rollup runtime branch
	if (!this._projectEmbedFileMapRemoveMeInBundle) {
		throw new Error(`We should never get here. This is a bug.`)
	}

	const creationOptions = _getCreationOptionsForEmbed(embedPath)
	const buffer = getEmbedData(this, embedPath)

	return createTemporaryResourceFromStringSync(
		(new TextDecoder).decode(buffer), creationOptions
	).resourceURL
}

export function getEmbedAsURLNodeFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
