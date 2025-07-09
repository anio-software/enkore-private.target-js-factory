import type {EmbedProtocol} from "./EmbedProtocol.ts"
import type {EmbedContentType} from "./EmbedContentType.ts"

const embedContentTypeByProtocol: Record<EmbedProtocol, EmbedContentType> = {
	"text"     : {mimeType: "text/plain"     , fileExtension: ".txt"},
	"js-bundle": {mimeType: "text/javascript", fileExtension: ".mjs"},
	"js"       : {mimeType: "text/javascript", fileExtension: ".mjs"},
	"dts"      : {mimeType: "text/plain"     , fileExtension: ".d.mts"}
}

export function _getEmbedContentTypeForProtocol(
	protocol: EmbedProtocol
): EmbedContentType {
	return embedContentTypeByProtocol[protocol]
}
