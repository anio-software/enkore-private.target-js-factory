import type {
	EnkoreJSRuntimeContextOptions
} from "@enkore/spec"

import {defaultGetCurrentLogLevel} from "./getCurrentLogLevel.mts"
import {compareLogLevel} from "../compareLogLevel.mts"

export const defaultShouldLog: NonNullable<EnkoreJSRuntimeContextOptions["shouldLog"]> = function(
	context,
	level,
	pkg,
	tag
) {
	void pkg;
	void tag;

	const currentLogLevel = (() => {
		if (!context.options.getCurrentLogLevel) {
			return defaultGetCurrentLogLevel(context)!
		}

		let newLogLevel = context.options.getCurrentLogLevel(context)

		if (newLogLevel === null) {
			return defaultGetCurrentLogLevel(context)!
		}

		return newLogLevel
	})()

	return compareLogLevel(
		level,
		">=",
		currentLogLevel
	)
}
