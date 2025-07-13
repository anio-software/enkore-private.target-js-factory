import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {JsBundlerOptions} from "@anio-software/enkore-private.target-js-toolchain_types"
import type {APIContext} from "./APIContext.ts"
import type {EntryPoint} from "./InternalData.ts"
import {generateProjectAPIContextForEntryPoint} from "./generateProjectAPIContextForEntryPoint.ts"
import {getProjectAPIMethodNames} from "#~export/project/getProjectAPIMethodNames.ts"
import {generateAPIExportGlueCode} from "#~export/generateAPIExportGlueCode.ts"
import {getEmbedAsString} from "@anio-software/enkore.target-js-node/project"
import {getBaseModuleSpecifier} from "#~src/getBaseModuleSpecifier.ts"
import {getToolchain} from "#~src/getToolchain.ts"

type Factory = NonNullable<JsBundlerOptions["additionalPlugins"]>[number]

export async function rollupPluginFactory(
	session: EnkoreSessionAPI,
	apiContext: APIContext,
	entryPointPath: string,
	entryPoint: EntryPoint
): Promise<Factory> {
	const toolchain = getToolchain(session)

	const projectContext = await generateProjectAPIContextForEntryPoint(
		session, entryPoint, entryPointPath
	)

	const projectContextString = JSON.stringify(JSON.stringify(projectContext))

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

		load(id) {
			if (id === `\x00enkore:projectAPI`) {
				let apiCode = ``

				apiCode += `import {generateProjectAPIFromContextRollup} from "enkore:generateProjectAPIFromContextRollup"\n`

				apiCode += `const __api = await generateProjectAPIFromContextRollup(JSON.parse(${projectContextString}));\n`

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
			}

			return null
		}
	}

	return {
		when: "pre",
		plugin
	}
}
