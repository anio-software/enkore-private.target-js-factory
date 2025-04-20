import type {ProjectAPIContext} from "./ProjectAPIContext.d.mts"
import type {ProjectAPI} from "./ProjectAPI.mts"
import {getEmbedAsStringFactory} from "./public/getEmbedAsStringFactory.mts"
import {getEmbedAsUint8ArrayFactory} from "./public/getEmbedAsUint8ArrayFactory.mts"
import {getEnkoreConfigurationFactory} from "./public/getEnkoreConfigurationFactory.mts"
import {getProjectIdFactory} from "./public/getProjectIdFactory.mts"
import {getProjectFactory} from "./public/getProjectFactory.mts"
import {getProjectPackageJSONFactory} from "./public/getProjectPackageJSONFactory.mts"

export async function _generateProjectAPIFromContextPartial(
	context: ProjectAPIContext
): Promise<Omit<ProjectAPI, "getEmbedAsURL">> {
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
