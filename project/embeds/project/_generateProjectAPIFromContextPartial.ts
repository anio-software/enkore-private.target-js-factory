import type {ProjectAPIContext} from "./ProjectAPIContext.ts"
import type {ProjectAPI} from "./ProjectAPI.ts"
import {getEmbedAsStringFactory} from "./public/getEmbedAsStringFactory.ts"
import {getEmbedAsUint8ArrayFactory} from "./public/getEmbedAsUint8ArrayFactory.ts"
import {getEnkoreConfigurationFactory} from "./public/getEnkoreConfigurationFactory.ts"
import {getProjectIdFactory} from "./public/getProjectIdFactory.ts"
import {getProjectFactory} from "./public/getProjectFactory.ts"
import {getProjectPackageJSONFactory} from "./public/getProjectPackageJSONFactory.ts"

export function _generateProjectAPIFromContextPartial(
	context: ProjectAPIContext
): Omit<ProjectAPI, "getEmbedAsURL"> {
	return {
		apiID: "EnkoreTargetJSProjectAPI",
		apiMajorVersion: 0,
		apiRevision: 0,
		getEmbedAsString: getEmbedAsStringFactory(context),
		getEmbedAsUint8Array: getEmbedAsUint8ArrayFactory(context),
		getEnkoreConfiguration: getEnkoreConfigurationFactory(context),
		getProjectId: getProjectIdFactory(context),
		getProject: getProjectFactory(context),
		getProjectPackageJSON: getProjectPackageJSONFactory(context)
	}
}
