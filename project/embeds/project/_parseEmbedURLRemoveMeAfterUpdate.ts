import type {JSEmbedProtocol} from "@anio-software/enkore-private.spec/primitives"

export function _parseEmbedURLRemoveMeAfterUpdate(url: string): {
	protocol: JSEmbedProtocol
	path: string
} {
	const tmp = url.split("://")

	if (tmp.length !== 2) {
		throw new Error(`Malformed embed url '${url}'.`)
	}

	const [protocol, path] = tmp

	return {
		protocol: protocol as JSEmbedProtocol,
		path
	}
}
