import type {ProjectAPI} from "./ProjectAPI.d.mts"
import type {ProjectAPIContext} from "./ProjectAPIContext.d.mts"
import {getEmbedAsStringFactory} from "./public/getEmbedAsStringFactory.mts"
import {getEmbedAsURLFactory} from "./public/getEmbedAsURLFactory.mts"
import {getEmbedAsUint8ArrayFactory} from "./public/getEmbedAsUint8ArrayFactory.mts"
import {getEnkoreConfigurationFactory} from "./public/getEnkoreConfigurationFactory.mts"
import {getProjectFactory} from "./public/getProjectFactory.mts"
import {getProjectPackageJSONFactory} from "./public/getProjectPackageJSONFactory.mts"

export async function generateProjectAPIFromContext(
	context: ProjectAPIContext
): Promise<ProjectAPI> {
	return {
		apiID: "EnkoreTargetJSProjectAPI",
		apiMajorVersion: 0,
		apiRevision: 0,
		getEmbedAsString: getEmbedAsStringFactory(context),
		getEmbedAsURL: getEmbedAsURLFactory(context),
		getEmbedAsUint8Array: getEmbedAsUint8ArrayFactory(context),
		getEnkoreConfiguration: getEnkoreConfigurationFactory(context),
		getProject: getProjectFactory(context),
		getProjectPackageJSON: getProjectPackageJSONFactory(context)
	}
}
