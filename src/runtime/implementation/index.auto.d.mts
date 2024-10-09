export type {UserContextType} from "./types/UserContextType.d.mts"
export type {ContextInstanceType} from "./types/ContextInstanceType.d.mts"
export type {LogLevelType} from "./types/LogLevelType.d.mts"
export type {FunctionTypeFromFactoryType} from "./types/FunctionTypeFromFactoryType.d.mts"
import type {CreateDefaultContextType} from "./methods/createDefaultContext.d.mts"
import type {GetProjectPackageJSONType} from "./methods/getProjectPackageJSON.d.mts"
import type {GetRuntimeVersionType} from "./methods/getRuntimeVersion.d.mts"
import type {LoadFourtuneConfigurationType} from "./methods/loadFourtuneConfiguration.d.mts"
import type {LoadResourceType} from "./methods/loadResource.d.mts"
import type {LoadResourceDynamicType} from "./methods/loadResourceDynamic.d.mts"
import type {UseContextType} from "./methods/useContext.d.mts"

export const createDefaultContext : CreateDefaultContextType
export const getProjectPackageJSON : GetProjectPackageJSONType
export const getRuntimeVersion : GetRuntimeVersionType
export const loadFourtuneConfiguration : LoadFourtuneConfigurationType
export const loadResource : LoadResourceType
export const loadResourceDynamic : LoadResourceDynamicType
export const useContext : UseContextType

declare const _default : {
    createDefaultContext: CreateDefaultContextType,
    getProjectPackageJSON: GetProjectPackageJSONType,
    getRuntimeVersion: GetRuntimeVersionType,
    loadFourtuneConfiguration: LoadFourtuneConfigurationType,
    loadResource: LoadResourceType,
    loadResourceDynamic: LoadResourceDynamicType,
    useContext: UseContextType,
}

export default _default
