import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {APIContext} from "./APIContext.d.mts"

export function getExternals(
	apiContext: APIContext,
	entryPointPath: string,
	session: EnkoreSessionAPI,
	kind: "packages" | "typePackages"
) {
	const configKey = kind === "typePackages" ? "externalTypePackages" : "externalPackages"

	const externals: Map<string, number> = new Map()

	const targetOptions = session.target.getOptions(apiContext.target)

	if (targetOptions[configKey]) {
		for (const pkg of targetOptions[configKey]) {
			externals.set(pkg, 1)
		}
	}

	if (targetOptions.exports && entryPointPath in targetOptions.exports) {
		const entryPointConfig = targetOptions.exports[entryPointPath]

		if (entryPointConfig[configKey]) {
			for (const pkg of entryPointConfig[configKey]) {
				externals.set(pkg, 1)
			}
		}
	}

	return [...externals.entries()].map(([key]) => {
		return key
	})
}
