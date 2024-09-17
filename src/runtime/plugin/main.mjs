import generateRuntimeInitData from "../node/generateRuntimeInitData.mjs"
import generateProjectResources from "../node/generateProjectResources.mjs"

import pluginResolveIdFactory from "./pluginResolveIdFactory.mjs"
import pluginLoadFactory from "./pluginLoadFactory.mjs"

import resourcesPlugin from "./resources.mjs"

export default async function(project_root) {
	const resources_rollup_plugin = await resourcesPlugin(project_root)
	const runtime_init_data = await generateRuntimeInitData(project_root)
	const project_resources = await generateProjectResources(project_root, resources_rollup_plugin)

	const ctx = {
		runtime_init_data,
		project_resources
	}

	const resolveId = pluginResolveIdFactory()
	const load = pluginLoadFactory(ctx, false)

	return {
		ctx,

		plugin() {
			return {
				name: "rollup-plugin-fourtune-runtime",
				resolveId,
				load
			}
		}
	}
}
