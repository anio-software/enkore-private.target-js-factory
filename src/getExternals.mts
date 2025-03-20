import type {EnkoreSessionAPI} from "@enkore/spec"

export function getExternals(entryPointPath: string, session: EnkoreSessionAPI) {
	const externals: Map<string, number> = new Map()

	const realmConfig = session.realm.getConfig("js")

	if (realmConfig.externalPackages) {
		for (const pkg of realmConfig.externalPackages) {
			externals.set(pkg, 1)
		}
	}

	if (realmConfig.exports && entryPointPath in realmConfig.exports) {
		const entryPointConfig = realmConfig.exports[entryPointPath]

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
