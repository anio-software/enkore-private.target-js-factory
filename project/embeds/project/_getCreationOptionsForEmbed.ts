import {_parseEmbedURL} from "./_parseEmbedURL.ts"
import {_getEmbedContentTypeForProtocol} from "./_getEmbedContentTypeForProtocol.ts"
import type {CreateTemporaryResourceOptions} from "@anio-software/pkg.temporary-resource-factory"

export function _getCreationOptionsForEmbed(
	embedURL: string
): CreateTemporaryResourceOptions {
	const {fileExtension, mimeType} = _getEmbedContentTypeForProtocol(
		_parseEmbedURL(embedURL).protocol
	)

	return {
		node: {fileExtension},
		web: {mimeType},
		autoCleanup: true,
		createAsReadonly: true
	}
}
