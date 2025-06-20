import type {Registry} from "./InternalData.ts"
import type {EnkoreTargetJSOptions} from "@anio-software/enkore-private.spec"

function normalizeRegistryURL(url: string) {
	for (let i = 0; i < url.length; ++i) {
		let index = url.length - 1 - i

		if (url[index] !== "/") {
			return url.slice(0, index + 1)
		}
	}

	return url
}

export function _getRegistryMap(targetOptions: EnkoreTargetJSOptions) {
	const registryMap: Map<string, Registry> = new Map()

	if (targetOptions.registry) {
		for (const registryId in targetOptions.registry) {
			const registry = targetOptions.registry[registryId]

			registryMap.set(registryId, {
				...registry,
				url: normalizeRegistryURL(registry.url)
			})
		}
	} else {
		registryMap.set("default", {
			url: "https://registry.npmjs.org/"
			// todo add authTokenFilePath
		})
	}

	return registryMap
}
