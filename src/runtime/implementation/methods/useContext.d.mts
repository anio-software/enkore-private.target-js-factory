import type {UsableContextType} from "../types/UsableContextType.d.mts"
import type {ContextInstanceType} from "../types/ContextInstanceType.d.mts"

export type UseContextType = (
	options_or_context : UsableContextType
) => ContextInstanceType
