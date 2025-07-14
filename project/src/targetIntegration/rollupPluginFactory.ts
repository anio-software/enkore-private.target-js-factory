import type {
	EnkoreSessionAPI,
	EnkoreJSRuntimeProjectAPIContext
} from "@anio-software/enkore-private.spec"
import type {JsBundlerOptions} from "@anio-software/enkore-private.target-js-toolchain_types"
import type {APIContext} from "./APIContext.ts"
import {getBaseModuleSpecifier} from "#~src/getBaseModuleSpecifier.ts"
import {isFileSync, readFileInChunks, readFileString} from "@anio-software/pkg.node-fs"
import {enkoreJSRuntimeInitCodeHeaderMarkerUUID} from "@anio-software/enkore-private.spec/uuid"
import {parseJSRuntimeInitHeader} from "./parseJSRuntimeInitHeader.ts"
import {getEmbedAsString} from "@anio-software/enkore.target-js-node/project"

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
			if (id === `${getBaseModuleSpecifier(apiContext.target)}/project`) {
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
