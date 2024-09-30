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
 * @brief Synchronously get the project's package.json
 */
export function getProjectPackageJSON() : object

/**
 * @brief Synchronously load the project's fourtune configuration
 */
export function loadFourtuneConfiguration() : object

//export function createDefaultContext(plugs : DefaultContextObjectPlugs) : DefaultContextObject

declare const _default: {
	loadResourceDynamic: typeof loadResourceDynamic,
	getProjectPackageJSON: typeof getProjectPackageJSON,
	loadFourtuneConfiguration: typeof loadFourtuneConfiguration,
//	createDefaultContext: typeof createDefaultContext
}

export default _default
