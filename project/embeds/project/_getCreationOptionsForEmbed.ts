import {_parseEmbedURLRemoveMeAfterUpdate} from "./_parseEmbedURLRemoveMeAfterUpdate.ts"
import {_getEmbedContentTypeForProtocol} from "./_getEmbedContentTypeForProtocol.ts"
import type {CreateTemporaryResourceOptions} from "@anio-software/pkg.temporary-resource-factory"

export function _getCreationOptionsForEmbed(
	embedURL: string
): CreateTemporaryResourceOptions {
	const {fileExtension, mimeType} = _getEmbedContentTypeForProtocol(
		_parseEmbedURLRemoveMeAfterUpdate(embedURL).protocol
	)

	return {
		node: {fileExtension},
		web: {mimeType},
		autoCleanup: true,
		createAsReadonly: true
	}
}
