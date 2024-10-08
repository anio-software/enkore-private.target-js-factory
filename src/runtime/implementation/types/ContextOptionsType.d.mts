import type {LogLevelType} from "./LogLevelType.d.mts"
import type {ContextInstanceType} from "./ContextInstanceType.d.mts"

export interface ContextOptionsType {
	/**
	 * @brief Tag of context, can be empty.
	 */
	tag : string

	/**
	 * @brief Retrieve the current log level.
	 */
	getCurrentLogLevel(this : ContextInstanceType) : LogLevelType

	/**
	 * @brief Print a line.
	 */
	printLine(this : ContextInstanceType, line : string): void

	/**
	 * @brief Log lines with a specific log level.
	 */
	logWithLevel(this : ContextInstanceType, level : LogLevelType, lines : Array<string>) : void

	/**
	 * @brief Determine whether a message should be logged.
	 */
	shouldLog(this : ContextInstanceType, level : LogLevelType) : boolean
	// todo: add parameters like "package_name" and "tag" to shouldLog()
}
