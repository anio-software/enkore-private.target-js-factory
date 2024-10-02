import type {CreateDefaultContextType} from "./methods/createDefaultContext.d.ts"
import type {GetProjectPackageJSONType} from "./methods/getProjectPackageJSON.d.ts"
import type {GetRuntimeVersionType} from "./methods/getRuntimeVersion.d.ts"
import type {LoadFourtuneConfigurationType} from "./methods/loadFourtuneConfiguration.d.ts"
import type {LoadResourceType} from "./methods/loadResource.d.ts"
import type {LoadResourceDynamicType} from "./methods/loadResourceDynamic.d.ts"
import type {UseContextType} from "./methods/useContext.d.ts"

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
