import type {Registry} from "./InternalData.d.mts"
import type {TargetOptions} from "./TargetOptions.d.mts"

export function _getRegistryMap(targetOptions: TargetOptions) {
	const registryMap: Map<string, Registry> = new Map()

	if (targetOptions.registry) {
		for (const registryId in targetOptions.registry) {
			const registry = targetOptions.registry[registryId]

			registryMap.set(registryId, registry)
		}
	} else {
		registryMap.set("default", {
			url: "https://registry.npmjs.org/"
			// todo add authTokenFilePath
		})
	}

	return registryMap
}
