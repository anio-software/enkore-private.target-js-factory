import type {EmbedProtocols} from "./EmbedProtocols.ts"

export function _getEmbedProtocols(): EmbedProtocols {
	return ["text", "js", "js-bundle", "dts"]
}
