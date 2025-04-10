import {
	readEnkoreConfigFile,
	getProjectRootFromArgumentAndValidate
} from "@enkore/common"
import {readFileJSON} from "@aniojs/node-fs"
import path from "node:path"

import type {ProjectAPIContext} from "./ProjectAPIContext.d.mts"

export async function generateProjectAPIContext(
	userProjectRoot: string | ["inferFromCLIArgs"]
): Promise<ProjectAPIContext> {
	const projectRoot = await getProjectRootFromArgumentAndValidate(
		userProjectRoot
	)

	const projectConfig = await readEnkoreConfigFile(projectRoot)
	const projectPackageJSON: any = await readFileJSON(
		path.join(projectRoot, "package.json")
	)

	return {
		projectRoot,
		projectConfig,
		projectPackageJSON
	}
}
