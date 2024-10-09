import type {UserContextType} from "../types/UserContextType.d.mts"
import type {WrappedContextType} from "../types/WrappedContextType.d.mts"

export type CreateDefaultContextType = (
	options_or_context : UserContextType
) => WrappedContextType
