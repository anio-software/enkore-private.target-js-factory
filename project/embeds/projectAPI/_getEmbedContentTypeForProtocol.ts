import type {
	JSEmbedProtocol
} from "@anio-software/enkore-private.spec/primitives"
import type {EmbedContentType} from "./EmbedContentType.ts"

const embedContentTypeByProtocol: Record<JSEmbedProtocol, EmbedContentType> = {
	"text"     : {mimeType: "text/plain"     , fileExtension: ".txt"},
	"js-bundle": {mimeType: "text/javascript", fileExtension: ".mjs"},
	"js"       : {mimeType: "text/javascript", fileExtension: ".mjs"},
	"dts"      : {mimeType: "text/plain"     , fileExtension: ".d.mts"}
}

export function _getEmbedContentTypeForProtocol(
	protocol: JSEmbedProtocol
): EmbedContentType {
	return embedContentTypeByProtocol[protocol]
}
