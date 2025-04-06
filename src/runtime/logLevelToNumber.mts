import type {JSRuntimeLogLevel} from "@enkore/spec/primitives"

export function logLevelToNumber(level: JSRuntimeLogLevel): number {
	const map: {
		[Level in JSRuntimeLogLevel]: number
	} = {
		// uint16 max 65535
		"fatal": 60000,
		"error": 50000,
		"warn" : 40000,
		"info" : 30000,
		"debug": 20000,
		"trace": 10000
	}

	if (level in map) {
		return map[level]
	}

	throw new Error(`should never get here, invalid runtime log level '${level}'`)
}
