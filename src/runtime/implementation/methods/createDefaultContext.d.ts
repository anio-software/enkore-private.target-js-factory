import type {UsableContextType} from "../types/UsableContextType.d.ts"
import type {WrappedContextType} from "../types/WrappedContextType.d.ts"

export type CreateDefaultContextType = (
	options_or_context : UsableContextType
) => WrappedContextType
