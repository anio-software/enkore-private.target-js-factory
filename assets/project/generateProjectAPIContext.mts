import {
	readEnkoreConfigFile,
	getProjectRootFromArgumentAndValidate,
	resolveImportSpecifierFromProjectRoot
} from "@enkore/common"
import {readFileJSON, scandir} from "@aniojs/node-fs"
import path from "node:path"
import {importAPI} from "@enkore/spec"
import {createNodeAPIOptions} from "@enkore/spec/factory"
import {generateEmbedFileMap} from "./generateEmbedFileMap.mts"

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

	//
	// if this API was called from node at runtime we need to make sure
	// objects/embeds is up-to-date. We achieve this by running a partial build
	//
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

	// we know objects/embeds is up-to-date at this point here
	const embedEntries = await scandir(path.join(projectRoot, "objects", "embeds"), {
		allow_missing_dir: true,
		filter(entry) {
			return entry.type === "regularFile"
		}
	})

	const projectEmbedFileMap = await generateEmbedFileMap(embedEntries)
	// tbd
	const projectId = ``

	return {
		projectId,
		projectConfig,
		projectPackageJSON,
		projectEmbedFileMap
	}
}
