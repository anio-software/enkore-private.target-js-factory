export interface ContextOptions {
	tag? : string

	getCurrentLogLevel?() : string

	logLine?(line : string): void

	logWithLevel?(level : string, lines : Array<string>) : void

	shouldLog?(level : string) : boolean
}

export interface ContextObject {
	_version : number

	_options : ContextOptions

	/**
	 * @brief Log a message with severity "debug".
	 */
	(...messages: Array<string>) : void

	/**
	 * @brief Log a message with severity "error".
	 */
	error(...messages: Array<string>) : void

	/**
	 * @brief Log a message with severity "warning".
	 */
	warn(...messages: Array<string>) : void

	/**
	 * @brief Log a message with severity "information".
	 */
	info(...messages: Array<string>) : void

	/**
	 * @brief Log a message with severity "debug".
	 */
	debug(...messages: Array<string>) : void

	/**
	 * @brief Log a message with severity "trace".
	 */
	trace(...messages: Array<string>) : void
}
