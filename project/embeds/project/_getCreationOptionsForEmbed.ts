import {_parseEmbedURL} from "./_parseEmbedURL.ts"
import type {EmbedContentType} from "./EmbedContentType.ts"
import type {EmbedProtocol} from "./EmbedProtocol.ts"
import type {CreateTemporaryResourceOptions} from "@anio-software/pkg.temporary-resource-factory"

const embedContentTypeByProtocol: Record<EmbedProtocol, EmbedContentType> = {
	"text"     : {mimeType: "text/plain"     , fileExtension: ".txt"},
	"js-bundle": {mimeType: "text/javascript", fileExtension: ".mjs"},
	"js"       : {mimeType: "text/javascript", fileExtension: ".mjs"},
	"dts"      : {mimeType: "text/plain"     , fileExtension: ".d.mts"}
}

export function _getCreationOptionsForEmbed(
	embedURL: string
): CreateTemporaryResourceOptions {
	const {protocol} = _parseEmbedURL(embedURL)
	const {fileExtension, mimeType} = embedContentTypeByProtocol[protocol]

	return {
		node: {fileExtension},
		web: {mimeType},
		autoCleanup: true,
		createAsReadonly: true
	}
}
