import generateRuntimeInitData from "../node/generateRuntimeInitData.mjs"
import generateProjectResources from "../node/generateProjectResources.mjs"

import pluginResolveIdFactory from "./pluginResolveIdFactory.mjs"
import pluginLoadFactory from "./pluginLoadFactory.mjs"

export default async function(project_root) {
	const runtime_init_data = await generateRuntimeInitData(project_root)
	const project_resources = await generateProjectResources(project_root, null)

	const ctx = {
		runtime_init_data,
		project_resources
	}

	const resolveId = pluginResolveIdFactory()

	return function fourtuneStaticRuntimePlugin({resource_path}) {
		const {fourtune_config} = ctx.runtime_init_data

		return {
			name: "rollup-plugin-fourtune-static-runtime",
			resolveId,
			async load(id) {
				let load = pluginLoadFactory(ctx, true)

				return await load(id)
			}
		}
	}
}
