import default_getCurrentLogLevel from "./context/default_getCurrentLogLevel.mjs"
import default_printLine from "./context/default_printLine.mjs"
import default_logWithLevel from "./context/default_logWithLevel.mjs"
import default_shouldLog from "./context/default_shouldLog.mjs"

export default function(runtime, {
	tag                = "",
	getCurrentLogLevel = default_getCurrentLogLevel,
	printLine          = default_printLine,
	logWithLevel       = default_logWithLevel,
	shouldLog          = default_shouldLog
} = {}) {
	let instance = {
		options: {
			tag,
			getCurrentLogLevel : getCurrentLogLevel.bind(instance),
			printLine          : printLine.bind(instance),
			logWithLevel       : logWithLevel.bind(instance),
			shouldLog          : shouldLog.bind(instance)
		},

		log() {
			
		}
	}

	return {
		_version: 0,

		instance
	}
}
