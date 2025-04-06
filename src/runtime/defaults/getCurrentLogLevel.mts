import type {
	EnkoreJSRuntimeContextOptions
} from "@enkore/spec"
import type {JSRuntimeLogLevel} from "@enkore/spec/primitives"
import {isValidLogLevelString} from "../isValidLogLevelString.mts"

function toLowerCase(v: any): string {
	if (!("toLowerCase" in v)) return ""

	return v.toLowerCase()
}

export const defaultGetCurrentLogLevel: EnkoreJSRuntimeContextOptions["getCurrentLogLevel"] = function(
	context
): JSRuntimeLogLevel {
	void context;

	const defaultLogLevel = "info"
	const envKey = "ENKORE_RUNTIME_LOG_LEVEL"

	return (() => {
		let envObject: object|null = null

		if (typeof process === "object") {
			envObject = process.env
		} else if (typeof window === "object") {
			envObject = window
		}

		if (!envObject) {
			return defaultLogLevel
		} else if (!(envKey in envObject)) {
			return defaultLogLevel
		}

		const newLogLevel = toLowerCase(envObject[envKey])

		if (isValidLogLevelString(newLogLevel)) {
			return newLogLevel
		}

		return defaultLogLevel
	})()
}
