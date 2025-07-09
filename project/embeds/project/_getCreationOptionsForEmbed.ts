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
	const parts = embedURL.split("://")

	if (2 > parts.length) {
		throw new Error(`Invalid embed URL '${embedURL}'.`)
	}

	const protocol = parts[0]

	if (!(protocol in embedContentTypeByProtocol)) {
		throw new Error(`Invalid embed protocol '${protocol}'.`)
	}

	const {fileExtension, mimeType} = embedContentTypeByProtocol[protocol as EmbedProtocol]

	return {
		node: {fileExtension},
		web: {mimeType},
		autoCleanup: true,
		createAsReadonly: true
	}
}
