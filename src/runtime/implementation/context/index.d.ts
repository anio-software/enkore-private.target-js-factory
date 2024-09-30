import type {ContextInstance} from "./instance.d.ts"
import type {ContextUserOptions} from "./options.d.ts"

interface WrappedContext {
	/**
	 * @brief Version of the context.
	 */
	_version : number

	/**
	 * @brief The context instance.
	 */
	instance : ContextInstance
}

export function createDefaultContext(
	context_or_options: (WrappedContext | ContextUserOptions)
) : WrappedContext

export function useContext (
	context_or_options: (WrappedContext | ContextUserOptions)
) : ContextInstance
