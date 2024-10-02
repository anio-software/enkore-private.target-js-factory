import type {ResourceReturnType} from "../types/ResourceReturnType.d.ts"

/**
 * @brief Dynamically load a resource
 */
export type LoadResourceDynamicType = (url : string) => ResourceReturnType
