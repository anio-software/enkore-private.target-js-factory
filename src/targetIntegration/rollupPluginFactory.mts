import type {EnkoreSessionAPI} from "@enkore/spec"
import type {JsBundlerOptions} from "@enkore-types/rollup"
import type {APIContext} from "./APIContext.d.mts"

type Factory = NonNullable<JsBundlerOptions["additionalPlugins"]>[number]

export async function rollupPluginFactory(
	session: EnkoreSessionAPI,
	apiContext: APIContext
): Promise<Factory> {
	const plugin: Factory["plugin"] = {
		name: "enkore-target-js-project-plugin"
	}

	return {
		when: "pre",
		plugin
	}
}
