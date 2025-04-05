import type {RuntimeAPI} from "#~src/runtime/RuntimeAPI.d.mts"
import type {RuntimeAPIContext} from "#~src/runtime/RuntimeAPIContext.d.mts"
import {compareLogLevelFactory} from "#~src/runtime/public/compareLogLevelFactory.mts"
import {createContextFactory} from "#~src/runtime/public/createContextFactory.mts"
import {getEmbedAsStringFactory} from "#~src/runtime/public/getEmbedAsStringFactory.mts"
import {getEmbedAsURLFactory} from "#~src/runtime/public/getEmbedAsURLFactory.mts"
import {getEmbedAsUint8ArrayFactory} from "#~src/runtime/public/getEmbedAsUint8ArrayFactory.mts"
import {getEnkoreConfigurationFactory} from "#~src/runtime/public/getEnkoreConfigurationFactory.mts"
import {getProjectFactory} from "#~src/runtime/public/getProjectFactory.mts"
import {getProjectPackageJSONFactory} from "#~src/runtime/public/getProjectPackageJSONFactory.mts"

export async function generateRuntimeAPI(
	context: RuntimeAPIContext
): Promise<RuntimeAPI> {
	return {
		apiID: "EnkoreTargetJSRuntimeAPI",
		apiMajorVersion: 0,
		apiRevision: 0,
		compareLogLevel: compareLogLevelFactory(context),
		createContext: createContextFactory(context),
		getEmbedAsString: getEmbedAsStringFactory(context),
		getEmbedAsURL: getEmbedAsURLFactory(context),
		getEmbedAsUint8Array: getEmbedAsUint8ArrayFactory(context),
		getEnkoreConfiguration: getEnkoreConfigurationFactory(context),
		getProject: getProjectFactory(context),
		getProjectPackageJSON: getProjectPackageJSONFactory(context)
	}
}
