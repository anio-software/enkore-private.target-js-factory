export default async function(fourtune_session) {
	const project_config = fourtune_session.getProjectConfig()
	const {target} = project_config
	const {function_name} = target

	const mapping = {}

	mapping[`export/${function_name}Factory.mts`] = [`template/auto/${function_name}Factory.mts`, "async"]
	mapping[`export/${function_name}SyncFactory.mts`] = [`template/auto/${function_name}Factory.mts`, "sync"]

	mapping[`export/${function_name}.mts`] = [`template/auto/${function_name}.mts`, "async"]
	mapping[`export/${function_name}Sync.mts`] = [`template/auto/${function_name}.mts`, "sync"]

	mapping[`export/_DependenciesType.d.mts`] = [`template/auto/DependenciesType.d.mts`, "async"]
	mapping[`export/_DependenciesSyncType.d.mts`] = [`template/auto/DependenciesType.d.mts`, "sync"]

	mapping[`export/_implementation.mts`] = [`template/implementation.mts`, "async"]
	mapping[`export/_implementationSync.mts`] = [`template/implementation.mts`, "sync"]

	for (const file_name in mapping) {
		fourtune_session.autogenerate.addFile(
			file_name, {
				generator:fourtune_session.autogenerate.generateSyncAsyncVariant(
					mapping[file_name][0], mapping[file_name][1]
				),
				generator_args: []
			}
		)
	}
}
