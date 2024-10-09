//
// instance has type "object" because it's not known
// what version the instance object is
//
export type WrappedContextType = {
	/**
	 * @brief Version of the context.
	 */
	_version : number

	/**
	 * @brief The wrapped context instance.
	 */
	instance : object
}
