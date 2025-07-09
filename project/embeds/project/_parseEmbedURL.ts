import type {EmbedProtocol} from "./EmbedProtocol.ts"
import {_getEmbedProtocols} from "./_getEmbedProtocols.ts"

export function _parseEmbedURL(embedURL: string): {
	protocol: EmbedProtocol,
	relativePath: string
} {
	const parts = embedURL.split("://")

	if (2 > parts.length) {
		throw new Error(`Invalid embed URL '${embedURL}'.`)
	}

	const protocol = parts[0] as EmbedProtocol

	if (!_getEmbedProtocols().includes(protocol)) {
		throw new Error(`Invalid embed protocol '${protocol}'`)
	}

	return {
		protocol,
		relativePath: parts[1]
	}
}
