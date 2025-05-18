import type {Registry} from "./InternalData.d.mts"
import {readFileStringSync} from "@aniojs/node-fs"

type Options = {
	scope?: string | undefined
	includeAuthToken?: boolean
}

export function _npmRegistryToConfigString(
	registry: Registry,
	options?: Options
) {
	const hasNoScope = options?.scope === "" || options?.scope === undefined
	const base = removeHTTPProtocolFromURL(registry.url)

	let config = ``

	if (hasNoScope) {
		config += `registry=${JSON.stringify(registry.url)}\n`
	} else {
		config += `${options.scope}:registry=${JSON.stringify(registry.url)}\n`
	}

	if (registry.authTokenFilePath && options?.includeAuthToken === true) {
		const authToken = readFileStringSync(
			registry.authTokenFilePath
		).trim()

		config += `//${base}:_authToken=${JSON.stringify(authToken)}\n`
	}

	if (registry.clientPrivateKeyFilePath) {
		const filePath = registry.clientPrivateKeyFilePath

		config += `//${base}:keyfile=${JSON.stringify(filePath)}\n`
	}

	if (registry.clientCertificateFilePath) {
		const filePath = registry.clientCertificateFilePath

		config += `//${base}:certfile=${JSON.stringify(filePath)}\n`
	}

	return config

	function removeHTTPProtocolFromURL(url: string) {
		if (url.startsWith("https://")) {
			return url.slice("https://".length)
		} else if (url.startsWith("http://")) {
			return url.slice("http://".length)
		}

		return url
	}
}
