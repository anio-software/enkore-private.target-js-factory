import rollupPluginFactory from "../auto/plugin.mjs"

export default async function(project_root) {
	const {plugin} = await rollupPluginFactory(project_root)

	return plugin()
}
