//() : LogLevelType
import getLogLevels from "../getLogLevels.mjs"

const log_levels = getLogLevels()

export default function() {
	let current_log_level = "info"

	if (typeof process === "object") {
		if ("FOURTUNE_RUNTIME_LOG_LEVEL" in process.env) {
			current_log_level = process.env["FOURTUNE_RUNTIME_LOG_LEVEL"].toLowerCase()
		}
	} else if (typeof window === "object") {
		if ("FOURTUNE_RUNTIME_LOG_LEVEL" in window) {
			current_log_level = window.FOURTUNE_RUNTIME_LOG_LEVEL.toLowerCase()
		}
	}

	if (!(current_log_level in log_levels)) {
		default_logLine(`Warning: invalid log level '${current_log_level}'`)

		current_log_level = "info"
	}

	return current_log_level
}
