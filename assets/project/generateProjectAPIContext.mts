import {
	readEnkoreConfigFile,
	getProjectRootFromArgumentAndValidate,
	resolveImportSpecifierFromProjectRoot
} from "@enkore/common"
import {readFileJSON} from "@aniojs/node-fs"
import path from "node:path"
import {importAPI} from "@enkore/spec"
import {createNodeAPIOptions} from "@enkore/spec/factory"

import type {ProjectAPIContext} from "./ProjectAPIContext.d.mts"

export async function generateProjectAPIContext(
	userProjectRoot: string | ["inferFromCLIArgs"],
	invokeEnkore: boolean
): Promise<ProjectAPIContext> {
	const projectRoot = await getProjectRootFromArgumentAndValidate(
		userProjectRoot
	)

	const projectConfig = await readEnkoreConfigFile(projectRoot)
	const projectPackageJSON: any = await readFileJSON(
		path.join(projectRoot, "package.json")
	)

	if (invokeEnkore) {
		const enkorePath = resolveImportSpecifierFromProjectRoot(
			projectRoot, "enkore"
		)

		if (!enkorePath) {
			throw new Error(`Unable to resolve "enkore" from the project root.`)
		}

		const {enkore} = await importAPI(enkorePath, "EnkoreNodeAPI", 0)

		const {project} = await enkore(projectRoot, createNodeAPIOptions({
			force: false,
			isCIEnvironment: false,
			npmBinaryPath: undefined,
			onlyInitializeProject: false,
			stdIOLogs: false,
			_forceBuild: false,
			_partialBuild: true,
		}))

		const {messages} = await project.build()

		console.log(messages)
	}

	return {
		projectConfig,
		projectPackageJSON
	}
}
