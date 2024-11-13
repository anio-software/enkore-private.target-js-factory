import getFilesToAutogenerate from "./getFilesToAutogenerate.mjs"

export async function initAsyncSyncPackage(fourtune_session) {
	const mapping = {}

	const files = await getFilesToAutogenerate(fourtune_session)

	for (const file in files) {
		mapping[file] = [
			"generateAsyncSyncVariantFromString",
			files[file]
		]
	}

	const {target} = fourtune_session.getProjectConfig()
	const targets = Array.isArray(target) ? target : [target]

	for (const target of targets) {
		const {function_name} = target

		mapping[`src/async.sync/${function_name}/Implementation<X>DocType.d.mts`] = [
			"generateAsyncSyncVariant",
			`src/template/async.sync/${function_name}/ImplementationXXXDocType.d.mts`
		]

		mapping[`src/async.sync/${function_name}/implementation<X>.mts`] = [
			"generateAsyncSyncVariant",
			`src/template/async.sync/${function_name}/implementationXXX.mts`
		]
	}

	for (const file_name in mapping) {
		const async_file_name = file_name.split("<X>").join("")
		const sync_file_name = file_name.split("<X>").join("Sync")

		const [generator_fn, source] = mapping[file_name]
		const generator = fourtune_session.autogenerate[generator_fn]

		fourtune_session.autogenerate.addFourtuneFile(
			async_file_name, generator(source, "async")
		)

		fourtune_session.autogenerate.addFourtuneFile(
			sync_file_name, generator(source, "sync")
		)
	}
}
