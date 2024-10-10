export default async function(fourtune_session) {
	const project_config = fourtune_session.getProjectConfig()
	const target = project_config
}

/*
	const {function_name} = fourtune_session.getProjectConfig().target

	fourtune_session.autogenerate.addFile(
		`export/${function_name}Factory.mts`, {
			generator:fourtune_session.autogenerate.generateSyncAsyncVariant(
				`template/auto/${function_name}Factory.mts`, "async"
			),
			generator_args: []
		}
	)

	fourtune_session.autogenerate.addFile(
		`export/${function_name}SyncFactory.mts`, {
			generator:fourtune_session.autogenerate.generateSyncAsyncVariant(
				`template/auto/${function_name}Factory.mts`, "sync"
			),
			generator_args: []
		}
	)

	fourtune_session.autogenerate.addFile(
		`export/${function_name}.mts`, {
			generator:fourtune_session.autogenerate.generateSyncAsyncVariant(
				`template/auto/${function_name}.mts`, "async"
			),
			generator_args: []
		}
	)

	fourtune_session.autogenerate.addFile(
		`export/${function_name}Sync.mts`, {
			generator:fourtune_session.autogenerate.generateSyncAsyncVariant(
				`template/auto/${function_name}.mts`, "sync"
			),
			generator_args: []
		}
	)

	fourtune_session.autogenerate.addFile(
		`export/_DependenciesType.d.mts`, {
			generator:fourtune_session.autogenerate.generateSyncAsyncVariant(
				`template/auto/DependenciesType.d.mts`, "async"
			),
			generator_args: []
		}
	)

	fourtune_session.autogenerate.addFile(
		`export/_DependenciesTypeSync.d.mts`, {
			generator:fourtune_session.autogenerate.generateSyncAsyncVariant(
				`template/auto/DependenciesType.d.mts`, "sync"
			),
			generator_args: []
		}
	)


	fourtune_session.autogenerate.addFile(
		`export/_implementation.mts`, {
			generator:fourtune_session.autogenerate.generateSyncAsyncVariant(
				`template/implementation.mts`, "async"
			),
			generator_args: []
		}
	)

	fourtune_session.autogenerate.addFile(
		`export/_implementationSync.mts`, {
			generator:fourtune_session.autogenerate.generateSyncAsyncVariant(
				`template/implementation.mts`, "sync"
			),
			generator_args: []
		}
	)
	*/
