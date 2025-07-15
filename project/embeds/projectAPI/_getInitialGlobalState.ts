import {createEntity} from "@anio-software/enkore-private.spec"

export function _getInitialGlobalState() {
	return createEntity("EnkoreJSRuntimeGlobalState", 0, 0, {
		immutable: {
			embeds: new Map()
		},

		mutable: {
			embedResourceURLs: new Map()
		}
	})
}
