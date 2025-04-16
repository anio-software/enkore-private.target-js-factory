import {
	readEnkoreConfigFile,
	getProjectRootFromArgumentAndValidate,
	resolveImportSpecifierFromProjectRoot
} from "@enkore/common"
import type {NodePackageJSON} from "@enkore/spec/primitives"
import {readFileJSON, scandir} from "@aniojs/node-fs"
import path from "node:path"
import {importAPI} from "@enkore/spec"
import {createNodeAPIOptions} from "@enkore/spec/factory"
import {generateEmbedFileMap} from "./generateEmbedFileMap.mts"
import crypto from "node:crypto"
import type {ProjectAPIContext} from "./ProjectAPIContext.d.mts"

function sha256Sync(str: string): string {
	const hash = crypto.createHash("sha256")

	return hash.update(str).digest("hex").toLowerCase()
}

export async function generateProjectAPIContext(
	userProjectRoot: string | ["inferFromCLIArgs"],
	invokeEnkore: boolean
): Promise<ProjectAPIContext> {
	const projectRoot = await getProjectRootFromArgumentAndValidate(
		userProjectRoot
	)

	const projectConfig = await readEnkoreConfigFile(projectRoot)
	const projectPackageJSON = (await readFileJSON(
		path.join(projectRoot, "package.json")
	)) as NodePackageJSON

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
	const projectId = sha256Sync(
		`${projectPackageJSON.name}@${projectPackageJSON.version}`
	)

	return {
		projectId,
		projectConfig,
		projectPackageJSON,
		projectEmbedFileMap
	}
}
