import {
	type EnkoreSessionAPI
} from "@anio-software/enkore-private.spec"
import type {JsBundlerOptions} from "@anio-software/enkore-private.target-js-toolchain_types"

type Factory = NonNullable<JsBundlerOptions["additionalPlugins"]>[number]

export function rollupCSSStubPluginFactory(
	session: EnkoreSessionAPI
): Factory {
	const plugin: Factory["plugin"] = {
		name: "enkore-target-js-css-stub-plugin",

		resolveId(id) {
			if (id.endsWith(".css")) {
				session.enkore.emitMessage(
					`debug`, `stubbing import of css file '${id}'`
				)

				return `\x00enkore-css-stub`
			}

			return null
		},

		load(id) {
			if (id === `\x00enkore-css-stub`) {
				return ``
			}

			return null
		}
	}

	return {
		when: "pre",
		plugin
	}
}
