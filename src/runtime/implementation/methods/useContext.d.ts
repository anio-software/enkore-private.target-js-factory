import type {UsableContextType} from "../types/UsableContextType.d.ts"
import type {ContextInstanceType} from "../types/ContextInstanceType.d.ts"

export type UseContextType = (
	options_or_context : UsableContextType
) => ContextInstanceType
