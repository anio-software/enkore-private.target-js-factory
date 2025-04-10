import {
	readEnkoreConfigFile,
	getProjectRootFromArgumentAndValidate
} from "@enkore/common"
import {readFileJSON} from "@aniojs/node-fs"
import path from "node:path"

import type {ProjectAPI} from "#~assets/project/ProjectAPI.d.mts"
import type {ProjectAPIContext} from "#~assets/project/ProjectAPIContext.d.mts"
import {getEmbedAsStringFactory} from "#~assets/project/public/getEmbedAsStringFactory.mts"
import {getEmbedAsURLFactory} from "#~assets/project/public/getEmbedAsURLFactory.mts"
import {getEmbedAsUint8ArrayFactory} from "#~assets/project/public/getEmbedAsUint8ArrayFactory.mts"
import {getEnkoreConfigurationFactory} from "#~assets/project/public/getEnkoreConfigurationFactory.mts"
import {getProjectFactory} from "#~assets/project/public/getProjectFactory.mts"
import {getProjectPackageJSONFactory} from "#~assets/project/public/getProjectPackageJSONFactory.mts"

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
