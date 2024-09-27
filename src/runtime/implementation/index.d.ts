/**
 * @brief Get runtime version number
 */
export function getRuntimeVersion() : string

type ResourceReturnType = string | Uint8Array

interface LoadResourceFunction {
	/**
	 * @brief Synchronously load a resource
	 * @description
	 * Synchronously load the resource at `url`.
	 * @param url URL of the resource.
	 * @return
	 * The resources content.
	 */
	(url : string) : ResourceReturnType

	/**
	 * @brief Synchronously load a resource
	 * @description
	 * Synchronously load the resource at `url`.
	 * @param url URL of the resource.
	 * @return
	 * URL that points to the loaded resource.
	 */
	asURL(url : string) : string
}

export const loadResource : LoadResourceFunction

/**
 * @brief Dynamically load a resource
 */
export function loadResourceDynamic(url : string) : ResourceReturnType

/**
 * @brief Synchronously load the project's package.json
 */
export function loadProjectPackageJSON() : object

/**
 * @brief Synchronously load the project's fourtune configuration
 */
export function loadFourtuneConfiguration() : object

export interface DefaultContextObjectLog {
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

export interface DefaultContextObject {
	log : DefaultContextObjectLog

	/**
	 * @brief The project's package.json object.
	 */
	package_json : object
}

export function createDefaultContext() : DefaultContextObject

declare const _default: {
	loadResourceDynamic: typeof loadResourceDynamic,
	loadProjectPackageJSON: typeof loadProjectPackageJSON,
	loadFourtuneConfiguration: typeof loadFourtuneConfiguration,
	createDefaultContext: typeof createDefaultContext
}

export default _default
