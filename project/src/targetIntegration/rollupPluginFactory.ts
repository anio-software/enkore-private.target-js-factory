import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {JsBundlerOptions} from "@anio-software/enkore-private.target-js-toolchain_types"
import type {APIContext} from "./APIContext.ts"
import {getProjectAPIMethodNames} from "#~export/project/getProjectAPIMethodNames.ts"
import {generateAPIExportGlueCode} from "#~export/generateAPIExportGlueCode.ts"
import {getEmbedAsString} from "@anio-software/enkore.target-js-node/project"
import {getBaseModuleSpecifier} from "#~src/getBaseModuleSpecifier.ts"
import {getToolchain} from "#~src/getToolchain.ts"
import {isFileSync, readFileInChunks, readFileString} from "@anio-software/pkg.node-fs"
import {enkoreJSRuntimeInitCodeHeaderMarkerUUID} from "@anio-software/enkore-private.spec/uuid"
import {parseJSRuntimeInitHeader} from "./parseJSRuntimeInitHeader.ts"

type Factory = NonNullable<JsBundlerOptions["additionalPlugins"]>[number]

export async function rollupPluginFactory(
	session: EnkoreSessionAPI,
	apiContext: APIContext,
	projectAPIContext: ProjectAPIContext
): Promise<Factory> {
	const toolchain = getToolchain(session)

	const projectAPIContextCopy = {...projectAPIContext}
	delete projectAPIContextCopy._projectEmbedFileMapRemoveMeInBundle

	const projectAPIContextString = JSON.stringify(JSON.stringify(projectAPIContextCopy))

	const plugin: Factory["plugin"] = {
		name: "enkore-target-js-project-plugin",

		resolveId(id) {
			if (id === `${getBaseModuleSpecifier(apiContext.target)}/project`) {
				return `\x00enkore:projectAPI`
			} else if (id === `enkore:generateProjectAPIFromContextRollup`) {
				return `\x00enkore:generateProjectAPIFromContextRollup`
			}

			return null
		},

		async load(id) {
			if (id === `\x00enkore:projectAPI`) {
				let apiCode = ``

				apiCode += `import {generateProjectAPIFromContextRollup} from "enkore:generateProjectAPIFromContextRollup"\n`

				apiCode += `const __api = generateProjectAPIFromContextRollup(JSON.parse(${projectAPIContextString}));\n`

				apiCode += generateAPIExportGlueCode(
					"TypeDoesntMatterWillBeStrippedAnyway",
					"__api",
					getProjectAPIMethodNames()
				)

				return toolchain.stripTypeScriptTypes(
					apiCode, {
						rewriteImportExtensions: false
					}
				)
			} else if (id === `\x00enkore:generateProjectAPIFromContextRollup`) {
				return getEmbedAsString(
					"js-bundle://project/generateProjectAPIFromContextRollup.ts"
				) as string
			} else if (isFileSync(id)) {
				const marker = enkoreJSRuntimeInitCodeHeaderMarkerUUID

				const reader = await readFileInChunks(id, 512)
				const header = await reader.readNextChunk()
				await reader.close()

				if (!header) {
					return null
				} else if (!header.toString().startsWith(`/*${marker}:`)) {
					return null
				}

				const code = await readFileString(id)
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
