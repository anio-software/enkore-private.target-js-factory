import type {
	JSRuntimeLogLevel,
	JSRuntimeLogLevelTuple
} from "@enkore/spec/primitives"

export function isValidLogLevelString(
	str: string
): str is JSRuntimeLogLevel {
	const logLevels: JSRuntimeLogLevelTuple = [
		"fatal",
		"error",
		"warn",
		"info",
		"debug",
		"trace"
	]

	for (const logLevel of logLevels) {
		if (logLevel === str) {
			return true
		}
	}

	return false
}
