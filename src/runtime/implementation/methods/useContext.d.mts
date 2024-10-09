import type {UserContextType} from "../types/UserContextType.d.mts"
import type {ContextInstanceType} from "../types/ContextInstanceType.d.mts"

export type UseContextType = (
	options_or_context : UserContextType
) => ContextInstanceType
