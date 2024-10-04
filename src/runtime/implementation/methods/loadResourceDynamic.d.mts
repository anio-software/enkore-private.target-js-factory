import type {ResourceReturnType} from "../types/ResourceReturnType.d.mts"

/**
 * @brief Dynamically load a resource
 */
export type LoadResourceDynamicType = (url : string) => ResourceReturnType
