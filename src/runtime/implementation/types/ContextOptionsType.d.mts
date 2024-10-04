import type {LogLevelType} from "./LogLevelType.d.mts"

export interface ContextOptionsType {
	/**
	 * @brief Tag of context, can be empty.
	 */
	tag : string

	/**
	 * @brief Retrieve the current log level.
	 */
	getCurrentLogLevel() : LogLevelType

	/**
	 * @brief Print a line.
	 */
	printLine(line : string): void

	/**
	 * @brief Log lines with a specific log level.
	 */
	logWithLevel(level : LogLevelType, lines : Array<string>) : void

	/**
	 * @brief Determine whether a message should be logged.
	 */
	shouldLog(level : LogLevelType) : boolean
}
