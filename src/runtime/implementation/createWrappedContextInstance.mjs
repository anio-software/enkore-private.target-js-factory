import default_getCurrentLogLevel from "./context/default_getCurrentLogLevel.mjs"
import default_printLine from "./context/default_printLine.mjs"
import default_logWithLevel from "./context/default_logWithLevel.mjs"
import default_shouldLog from "./context/default_shouldLog.mjs"
import getLogLevels from "./getLogLevels.mjs"

export default function(runtime, {
	tag                = "",
	getCurrentLogLevel = default_getCurrentLogLevel,
	printLine          = default_printLine,
	logWithLevel       = default_logWithLevel,
	shouldLog          = default_shouldLog
} = {}) {
	let instance = {runtime}

	instance.options = {
		tag,
		getCurrentLogLevel : getCurrentLogLevel.bind(instance),
		printLine          : printLine.bind(instance),
		logWithLevel       : logWithLevel.bind(instance),
		shouldLog          : shouldLog.bind(instance)
	}

	instance.log = function log(...messages) {
		instance.options.logWithLevel("debug", messages)
	}

	const log_levels = Object.keys(getLogLevels())

	for (const log_level of log_levels) {
		instance.log[log_level] = function log(...messages) {
			instance.options.logWithLevel(
				log_level, messages
			)
		}
	}

	return {
		_version: 0,

		instance
	}
}
