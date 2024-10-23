import createDefaultContext from "./methods/createDefaultContext.mjs"
import getProjectPackageJSON from "./methods/getProjectPackageJSON.mjs"
import getRuntimeVersion from "./methods/getRuntimeVersion.mjs"
import loadFourtuneConfiguration from "./methods/loadFourtuneConfiguration.mjs"
import loadResourceDynamic from "./methods/loadResourceDynamic.mjs"
import useContext from "./methods/useContext.mjs"

export default function(
	runtime_init_data, project_resources = null
) {
	const runtime = {
		resources: project_resources,
		resources_url: new Map(),

		init_data: runtime_init_data,

		createDefaultContext(...args) {
			return createDefaultContext(runtime, ...args)
		},
		getProjectPackageJSON(...args) {
			return getProjectPackageJSON(runtime, ...args)
		},
		getRuntimeVersion(...args) {
			return getRuntimeVersion(runtime, ...args)
		},
		loadFourtuneConfiguration(...args) {
			return loadFourtuneConfiguration(runtime, ...args)
		},
		loadResourceDynamic(...args) {
			return loadResourceDynamic(runtime, ...args)
		},
		useContext(...args) {
			return useContext(runtime, ...args)
		}
	}

	return runtime
}
