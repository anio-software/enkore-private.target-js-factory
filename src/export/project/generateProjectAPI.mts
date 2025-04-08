import {
	readEnkoreConfigFile,
	getProjectRootFromArgumentAndValidate
} from "@enkore/common"
import {readFileJSON} from "@aniojs/node-fs"
import path from "node:path"

import type {ProjectAPI} from "#~src/project/ProjectAPI.d.mts"
import type {ProjectAPIContext} from "#~src/project/ProjectAPIContext.d.mts"
import {getEmbedAsStringFactory} from "#~src/project/public/getEmbedAsStringFactory.mts"
import {getEmbedAsURLFactory} from "#~src/project/public/getEmbedAsURLFactory.mts"
import {getEmbedAsUint8ArrayFactory} from "#~src/project/public/getEmbedAsUint8ArrayFactory.mts"
import {getEnkoreConfigurationFactory} from "#~src/project/public/getEnkoreConfigurationFactory.mts"
import {getProjectFactory} from "#~src/project/public/getProjectFactory.mts"
import {getProjectPackageJSONFactory} from "#~src/project/public/getProjectPackageJSONFactory.mts"

export async function generateProjectAPI(
	userProjectRoot: string | ["inferFromCLIArgs"]
): Promise<ProjectAPI> {
	const projectRoot = await getProjectRootFromArgumentAndValidate(
		userProjectRoot
	)

	const projectConfig = await readEnkoreConfigFile(projectRoot)
	const projectPackageJSON: any = await readFileJSON(
		path.join(projectRoot, "package.json")
	)

	const context: ProjectAPIContext = {
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
