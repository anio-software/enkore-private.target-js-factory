import type {Registry} from "./InternalData.ts"
import {_npmRegistryToConfigString} from "./_npmRegistryToConfigString.ts"
import {_executeNPMWithConfig} from "./_executeNPMWithConfig.ts"

export function _getPublishedVersionsOfPackage(
	registry: Registry,
	packageName: string
): false|string[] {
	const npmConfig = _npmRegistryToConfigString(registry)

	const {stdout} = _executeNPMWithConfig(
		npmConfig, [
			"view",
			packageName,
			"versions",
			"--json"
		], {
			cwd: "/"
		}
	)

	try {
		const parsed = JSON.parse(stdout.toString())

		if (Array.isArray(parsed)) {
			return parsed
		}

		return parsed.error.code === "E404" ? false : []
	} catch {
		return false
	}
}
