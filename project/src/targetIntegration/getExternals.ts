import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {APIContext} from "./APIContext.ts"

// todo: externals should be per package, not per module specifier
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

	if (apiContext.target === "jsx-web" || apiContext.target === "jsx-hybrid") {
		const {bundleReactPackages} = session.target.getOptions(apiContext.target)

		if (bundleReactPackages !== true) {
			externals.set(`react`, 1)
			externals.set(`react/jsx-runtime`, 1)
			externals.set(`react-dom/client`, 1)
			externals.set(`react-dom/server`, 1)
		}
	}

	return [...externals.entries()].map(([key]) => {
		return key
	})
}
