import type {ContextOptionsType} from "./ContextOptionsType.d.ts"

interface ContextInstanceLogMethod {
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

//
// this interface is used by consumers of the context
//
export interface ContextInstanceType {
	options : ContextOptionsType

	log : ContextInstanceLogMethod
}
