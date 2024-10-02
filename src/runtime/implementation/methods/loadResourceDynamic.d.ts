import type {ResourceReturnType} from "../ResourceReturnType.d.ts"

/**
 * @brief Dynamically load a resource
 */
export type LoadResourceDynamicType = (url : string) => ResourceReturnType
