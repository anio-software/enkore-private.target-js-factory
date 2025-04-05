import type {EnkoreSessionAPI} from "@enkore/spec"
import type {APIContext} from "./APIContext.d.mts"

export function getExternals(
	apiContext: APIContext,
	entryPointPath: string,
	session: EnkoreSessionAPI
) {
	const externals: Map<string, number> = new Map()

	const targetConfig = session.target.getConfig(apiContext.target)

	if (targetConfig.externalPackages) {
		for (const pkg of targetConfig.externalPackages) {
			externals.set(pkg, 1)
		}
	}

	if (targetConfig.exports && entryPointPath in targetConfig.exports) {
		const entryPointConfig = targetConfig.exports[entryPointPath]

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
