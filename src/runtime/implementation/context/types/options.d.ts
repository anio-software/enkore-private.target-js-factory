export enum LogLevel {
	error = 3,
	warn  = 4,
	info  = 5,
	debug = 6,
	trace = 7
}

export interface ContextOptions {
	/**
	 * @brief Tag of context, can be empty.
	 */
	tag : string

	/**
	 * @brief Retrieve the current log level.
	 */
	getCurrentLogLevel() : LogLevel

	/**
	 * @brief Print a line.
	 */
	printLine(line : string): void

	/**
	 * @brief Log lines with a specific log level.
	 */
	logWithLevel(level : LogLevel, lines : Array<string>) : void

	/**
	 * @brief Determine whether a message should be logged.
	 */
	shouldLog(level : LogLevel) : boolean
}

export type ContextUserOptions = Partial<ContextOptions>
