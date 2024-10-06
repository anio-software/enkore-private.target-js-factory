//(level : LogLevelType) : boolean
import getLogLevels from "../getLogLevels.mjs"

const log_levels = getLogLevels()

export default function(level) {
	const message_log_level = log_levels[level]
	const current_log_level = log_levels[this.options.getCurrentLogLevel()]

	return !(message_log_level > current_log_level)
}
