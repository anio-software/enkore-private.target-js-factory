import {
	type EnkoreSessionAPI,
	type EnkoreJSRuntimeEmbeddedFile,
	createEntity
} from "@anio-software/enkore-private.spec"
import type {JsBundlerOptions} from "@anio-software/enkore-private.target-js-toolchain_types"
import type {APIContext} from "./APIContext.ts"
import type {EntryPoint} from "./InternalData.ts"
import type {ProjectAPIContext} from "#~embeds/project/ProjectAPIContext.ts"
import {generateProjectAPIContext} from "#~embeds/project/generateProjectAPIContext.ts"
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

	const projectContext = (
		await generateProjectAPIContext(session.project.root, false)
	) as Required<ProjectAPIContext>

	//
	// optimization: check which embeds can be trimmed/ommited
	// from the project context in order to save space
	//
	// todo: implement

	// projectContext is now trimmed
	const bundlerProjectContext = {...projectContext} as ProjectAPIContext

	delete bundlerProjectContext._projectEmbedFileMapRemoveMeInBundle;

	const bundlerProjectContextString = JSON.stringify(JSON.stringify(bundlerProjectContext))

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

				apiCode += `const __api = await generateProjectAPIFromContextRollup(JSON.parse(${bundlerProjectContextString}));\n`

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
