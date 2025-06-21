import {
	type EnkoreSessionAPI,
	type EnkoreJSRuntimeEmbeddedFile,
	createEntity
} from "@anio-software/enkore-private.spec"
import type {JsBundlerOptions} from "@anio-software/enkore-private.target-js-toolchain_types"
import type {APIContext} from "./APIContext.ts"
import type {EntryPoint} from "./InternalData.ts"
import type {ProjectAPIContext} from "#~embeds/project/ProjectAPIContext.ts"
import {getRequestedEmbeds} from "./getRequestedEmbeds.ts"
import {generateProjectAPIContext} from "#~embeds/project/generateProjectAPIContext.ts"
import {getProjectAPIMethodNames} from "#~export/project/getProjectAPIMethodNames.ts"
import {generateAPIExportGlueCode} from "#~export/generateAPIExportGlueCode.ts"
import {getEmbedAsString} from "@anio-software/enkore.target-js/project"
import {getInternalData} from "./getInternalData.ts"
import {baseModuleSpecifier} from "#~src/baseModuleSpecifier.ts"

type Factory = NonNullable<JsBundlerOptions["additionalPlugins"]>[number]

export async function rollupPluginFactory(
	session: EnkoreSessionAPI,
	apiContext: APIContext,
	entryPointPath: string,
	entryPoint: EntryPoint
): Promise<Factory> {
	const toolchain = session.target._getToolchain("js")

	const projectContext = (
		await generateProjectAPIContext(session.project.root, false)
	) as Required<ProjectAPIContext>

	//
	// optimization: check which embeds can be trimmed/ommited
	// from the project context in order to save space
	//
	const requestedEmbeds = await getRequestedEmbeds(session, apiContext, entryPoint)

	if (requestedEmbeds.result === "specific") {
		for (const [embedPath] of projectContext._projectEmbedFileMapRemoveMeInBundle.entries()) {
			if (!requestedEmbeds.usedEmbeds.has(embedPath)) {
				// should be safe as per https://stackoverflow.com/a/35943995 "ES6: Is it dangerous to delete elements from Set/Map during Set/Map iteration?"
				projectContext._projectEmbedFileMapRemoveMeInBundle.delete(embedPath)
				delete projectContext.projectEmbedFileTranslationMap[embedPath]
			}
		}
	}

	// projectContext is now trimmed
	const bundlerProjectContext = {...projectContext} as ProjectAPIContext

	delete bundlerProjectContext._projectEmbedFileMapRemoveMeInBundle;

	const bundlerProjectContextString = JSON.stringify(JSON.stringify(bundlerProjectContext))

	const plugin: Factory["plugin"] = {
		name: "enkore-target-js-project-plugin",

		intro() {
			if (session.target.getOptions(apiContext.target)._disableRuntimeCodeInjection === true) {
				return ""
			}

			const embeds: Record<string, EnkoreJSRuntimeEmbeddedFile> = {}

			for (const [embedPath, value] of projectContext._projectEmbedFileMapRemoveMeInBundle.entries()) {
				const hashPath = projectContext.projectEmbedFileTranslationMap[embedPath]
				const _createResourceAtRuntimeInit = (() => {
					if (requestedEmbeds.result === "all") {
						return true
					}

					if (!requestedEmbeds.usedEmbeds.has(embedPath)) {
						return false
					}

					const {
						requestedByMethods
					} = requestedEmbeds.usedEmbeds.get(embedPath)!

					return requestedByMethods.includes("getEmbedAsURL")
				})()

				embeds[hashPath] = createEntity("EnkoreJSRuntimeEmbeddedFile", 0, 0, {
					_createResourceAtRuntimeInit,
					projectId: projectContext.projectId,
					sourceFilePath: value.sourceFilePath,
					originalEmbedPath: embedPath,
					data: value.data,
					_projectIdentifier: `${session.project.packageJSON.name}@${session.project.packageJSON.version}`
				})
			}

			const record = createEntity("EnkoreJSRuntimeGlobalDataRecord", 0, 0, {
				immutable: {
					globalDataRecordId: `${getInternalData(session).projectId}/${entryPointPath}`,
					embeds
				},
				// will be populated / used at runtime
				mutable: {
					embedResourceURLs: {}
				}
			})

			//
			// this will later be merged with other global embed maps
			//
			return toolchain.defineEnkoreJSRuntimeGlobalDataRecord(record)
		},

		resolveId(id) {
			if (id === `${baseModuleSpecifier}/project`) {
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
