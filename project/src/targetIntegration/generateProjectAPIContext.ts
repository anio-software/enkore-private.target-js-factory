import {
	type EnkoreJSRuntimeProjectAPIContext,
	createEntity
} from "@anio-software/enkore-private.spec"
import type {NodePackageJSON} from "@anio-software/enkore-private.spec/primitives"
import {
	getProjectRootFromArgumentAndValidate,
	readEnkoreConfigFile
} from "@anio-software/enkore-private.spec/utils"

import {readFileJSON} from "@anio-software/pkg.node-fs"
import path from "node:path"

type EmbedMap = NonNullable<EnkoreJSRuntimeProjectAPIContext["_projectEmbedFileMapRemoveMeInBundle"]>

async function generateEmbedFileMap(
	projectRoot: string
): Promise<EmbedMap> {
	const embedMap: EmbedMap = new Map()

	return embedMap
}

export async function generateProjectAPIContext(
	userProjectRoot: string | ["inferFromCLIArgs"]
): Promise<EnkoreJSRuntimeProjectAPIContext> {
	const projectRoot = await getProjectRootFromArgumentAndValidate(
		userProjectRoot
	)

	const projectConfig = await readEnkoreConfigFile(projectRoot)
	const projectPackageJSON = await readFileJSON(
		path.join(projectRoot, "package.json")
	) as NodePackageJSON

	return createEntity("EnkoreJSRuntimeProjectAPIContext", 0, 0, {
		project: createEntity("EnkoreJSRuntimeProject", 0, 0, {
			enkoreConfiguration: JSON.parse(JSON.stringify(projectConfig)),
			packageJSON: JSON.parse(JSON.stringify(projectPackageJSON)),
			projectId: ""
		}),

		_projectEmbedFileMapRemoveMeInBundle: await generateEmbedFileMap(projectRoot)
	})
}
