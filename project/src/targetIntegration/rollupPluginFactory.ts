import type {
	EnkoreSessionAPI,
	EnkoreJSRuntimeProjectAPIContext
} from "@anio-software/enkore-private.spec"
import type {NodePackageJSON} from "@anio-software/enkore-private.spec/primitives"
import type {JsBundlerOptions} from "@anio-software/enkore-private.target-js-toolchain_types"
import type {APIContext} from "./APIContext.ts"
import {getBaseModuleSpecifier} from "#~src/getBaseModuleSpecifier.ts"
import {isFileSync, readFileInChunks, readFileString, findNearestFile, readFileJSON} from "@anio-software/pkg.node-fs"
import {enkoreJSRuntimeInitCodeHeaderMarkerUUID} from "@anio-software/enkore-private.spec/uuid"
import {parseJSRuntimeInitHeader} from "./parseJSRuntimeInitHeader.ts"
import {getEmbedAsString} from "@anio-software/enkore.target-js-node/project"
import path from "node:path"

type Factory = NonNullable<JsBundlerOptions["additionalPlugins"]>[number]

export async function rollupPluginFactory(
	session: EnkoreSessionAPI,
	apiContext: APIContext,
	projectAPIContext: EnkoreJSRuntimeProjectAPIContext
): Promise<Factory> {
	const projectAPIContextCopy = {...projectAPIContext}
	delete projectAPIContextCopy._projectEmbedFileMapRemoveMeInBundle

	const projectAPIContextString = JSON.stringify(JSON.stringify(projectAPIContextCopy))

	const plugin: Factory["plugin"] = {
		name: "enkore-target-js-project-plugin",

		resolveId(id) {
			if (id.startsWith(`@anio-software/enkore-private.js-runtime-helpers`)) {
				return {id, external: true}
			} else if (id.startsWith("@anio-software/enkore.js-runtime")) {
				return {id, external: true}
			} else if (id === `${getBaseModuleSpecifier(apiContext.target)}/project`) {
				return `\x00enkore:projectAPI`
			}

			return null
		},

		async load(id) {
			if (id === `\x00enkore:projectAPI`) {
				let moduleTemplate = getEmbedAsString("js://projectAPI/moduleTemplate.ts")

				moduleTemplate = moduleTemplate.split(`"%%CONTEXT_DATA%%"`).join(`JSON.parse(${projectAPIContextString})`)

				return moduleTemplate
			} else if (isFileSync(id)) {
				const marker = enkoreJSRuntimeInitCodeHeaderMarkerUUID

				const reader = await readFileInChunks(id, 512)
				const header = await reader.readNextChunk()
				await reader.close()

				const dependencyToLoad: string = await (async () => {
					if (!id.endsWith(".min.mjs")) {
						return id
					}

					const nearestEnkoreBuildFile = await findNearestFile("enkore-build.json", path.dirname(id))
					const nearestPackageJSONFile = await findNearestFile("package.json", path.dirname(id))

					if (nearestEnkoreBuildFile === false || nearestPackageJSONFile === false) {
						return id
					}

					if (path.dirname(nearestEnkoreBuildFile) !== path.dirname(nearestPackageJSONFile)) {
						session.enkore.emitMessage(`warning`, "enkore-build.json was found on a different level than package.json")

						return id
					}

					const packageJSON = await readFileJSON(nearestPackageJSONFile) as NodePackageJSON

					const newID = path.join(
						path.dirname(id),
						path.basename(id).slice(0, -(".min.mjs".length)) + ".mjs"
					)

					if (isFileSync(newID)) {
						session.enkore.emitMessage(`info`, `${packageJSON.name}: using index.mjs over index.min.mjs.`)

						return newID
					}

					return id
				})()

				const code = await readFileString(dependencyToLoad)

				if (!header) {
					return code
				} else if (!header.toString().startsWith(`/*${marker}:`)) {
					return code
				}

				const result = parseJSRuntimeInitHeader(code)

				if (result === false) {
					session.enkore.emitMessage("error", `failed to parse js runtime init header`)

					return null
				}

				session.enkore.emitMessage("info", `detected js runtime init header offset=${result.offset}`)

				return code.slice(result.offset)
			}

			return null
		}
	}

	return {
		when: "pre",
		plugin
	}
}
