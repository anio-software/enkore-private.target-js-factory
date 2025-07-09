import type {EmbedProtocol} from "./EmbedProtocol.ts"

export function _parseEmbedURL(embedURL: string): {
	protocol: EmbedProtocol,
	relativePath: string
} {
	const parts = embedURL.split("://")

	if (2 > parts.length) {
		throw new Error(`Invalid embed URL '${embedURL}'.`)
	}

	return {
		protocol: parts[0] as EmbedProtocol,
		relativePath: parts[1]
	}
}
