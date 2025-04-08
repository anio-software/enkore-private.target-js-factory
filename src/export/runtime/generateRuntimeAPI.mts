import {
	readEnkoreConfigFile,
	getProjectRootFromArgumentAndValidate
} from "@enkore/common"
import {readFileJSON} from "@aniojs/node-fs"
import path from "node:path"

import type {RuntimeAPI} from "#~src/runtime/RuntimeAPI.d.mts"
import type {RuntimeAPIContext} from "#~src/runtime/RuntimeAPIContext.d.mts"
import {getEmbedAsStringFactory} from "#~src/runtime/public/getEmbedAsStringFactory.mts"
import {getEmbedAsURLFactory} from "#~src/runtime/public/getEmbedAsURLFactory.mts"
import {getEmbedAsUint8ArrayFactory} from "#~src/runtime/public/getEmbedAsUint8ArrayFactory.mts"
import {getEnkoreConfigurationFactory} from "#~src/runtime/public/getEnkoreConfigurationFactory.mts"
import {getProjectFactory} from "#~src/runtime/public/getProjectFactory.mts"
import {getProjectPackageJSONFactory} from "#~src/runtime/public/getProjectPackageJSONFactory.mts"

export async function generateRuntimeAPI(
	userProjectRoot: string | ["inferFromCLIArgs"]
): Promise<RuntimeAPI> {
	const projectRoot = await getProjectRootFromArgumentAndValidate(
		userProjectRoot
	)

	const projectConfig = await readEnkoreConfigFile(projectRoot)
	const projectPackageJSON: any = await readFileJSON(
		path.join(projectRoot, "package.json")
	)

	const context: RuntimeAPIContext = {
		projectRoot,
		projectConfig,
		projectPackageJSON
	}

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
