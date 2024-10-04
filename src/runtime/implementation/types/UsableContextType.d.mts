import type {WrappedContextType} from "./WrappedContextType.d.mts"
import type {ContextOptionsType} from "./ContextOptionsType.d.mts"

export type UsableContextType = WrappedContextType | Partial<ContextOptionsType>
