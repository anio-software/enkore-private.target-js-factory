import type {EnkoreJSRuntimeGlobalState} from "@anio-software/enkore-private.spec"

export function _getInitialGlobalState(): EnkoreJSRuntimeGlobalState {
	return {
		entityKind: "EnkoreJSRuntimeGlobalState",
		entityMajorVersion: 0,
		entityRevision: 0,
		entityCreatedBy: null,

		immutable: {
			embeds: new Map()
		},

		mutable: {
			embedResourceURLs: new Map()
		}
	}
}
