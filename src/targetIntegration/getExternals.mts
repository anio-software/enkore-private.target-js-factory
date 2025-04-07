import type {EnkoreSessionAPI} from "@enkore/spec"
import type {APIContext} from "./APIContext.d.mts"

export function getExternals(
	apiContext: APIContext,
	entryPointPath: string,
	session: EnkoreSessionAPI
) {
	const externals: Map<string, number> = new Map()

	const targetOptions = session.target.getOptions(apiContext.target)

	if (targetOptions.externalPackages) {
		for (const pkg of targetOptions.externalPackages) {
			externals.set(pkg, 1)
		}
	}

	if (targetOptions.exports && entryPointPath in targetOptions.exports) {
		const entryPointConfig = targetOptions.exports[entryPointPath]

		if (entryPointConfig.externalPackages) {
			for (const pkg of entryPointConfig.externalPackages) {
				externals.set(pkg, 1)
			}
		}
	}

	return [...externals.entries()].map(([key]) => {
		return key
	})
}
