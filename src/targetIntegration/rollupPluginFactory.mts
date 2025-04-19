import type {EnkoreSessionAPI} from "@enkore/spec"
import type {JsBundlerOptions} from "@enkore-types/rollup"
import type {APIContext} from "./APIContext.d.mts"
import type {InternalData} from "./InternalData.d.mts"
import type {ProjectAPIContext} from "#~assets/project/ProjectAPIContext.mts"
import {getRequestedEmbeds} from "./getRequestedEmbeds.mts"
import {generateProjectAPIContext} from "#~assets/project/generateProjectAPIContext.mts"
import {getGlobalEmbedInitCode} from "./getGlobalEmbedInitCode.mts"

type Factory = NonNullable<JsBundlerOptions["additionalPlugins"]>[number]
type MapValueType<A> = A extends Map<any, infer V> ? V : never;

export async function rollupPluginFactory(
	session: EnkoreSessionAPI,
	apiContext: APIContext,
	exportMap: MapValueType<InternalData["entryPointMap"]>
): Promise<Factory> {
	const projectContext = (
		await generateProjectAPIContext(session.project.root, false)
	) as Required<ProjectAPIContext>

	//
	// optimization: check which embeds can be trimmed/ommited
	// from the project context in order to save space
	//
	const requestedEmbeds = await getRequestedEmbeds(session, apiContext, exportMap)

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

	const plugin: Factory["plugin"] = {
		name: "enkore-target-js-project-plugin",

		intro() {
			let embedMap: Record<string, unknown> = {}

			for (const [embedPath, value] of projectContext._projectEmbedFileMapRemoveMeInBundle.entries()) {
				const hashPath = projectContext.projectEmbedFileTranslationMap[embedPath]

				embedMap[hashPath] = value
			}

			//
			// this will later be merged with other global embed maps
			//
			return getGlobalEmbedInitCode(embedMap)
		}
	}

	return {
		when: "pre",
		plugin
	}
}
