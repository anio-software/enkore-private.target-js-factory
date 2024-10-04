import type {UsableContextType} from "../types/UsableContextType.d.mts"
import type {WrappedContextType} from "../types/WrappedContextType.d.mts"

export type CreateDefaultContextType = (
	options_or_context : UsableContextType
) => WrappedContextType
