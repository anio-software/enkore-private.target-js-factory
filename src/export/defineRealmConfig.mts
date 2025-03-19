import {
	type RawType,
	type EnkoreRealmJSConfig_V0_Rev0,
	createEntity
} from "@enkore/spec"

export function defineRealmConfig(
	config: Omit<RawType<EnkoreRealmJSConfig_V0_Rev0>, "_realm">
) {
	return createEntity("EnkoreRealmJSConfig", 0, 0, {
		_realm: "js",
		...config
	})
}
