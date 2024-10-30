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

	mapping[`Implementation<X>DocType.d.mts`] = [
		"generateAsyncSyncVariant",
		`src/template/ImplementationDocType.d.mts`
	]

	mapping[`implementation<X>.mts`] = [
		"generateAsyncSyncVariant",
		`src/template/implementation.mts`
	]

	for (const file_name in mapping) {
		const async_file_name = file_name.split("<X>").join("")
		const sync_file_name = file_name.split("<X>").join("Sync")

		const [generator_fn, source] = mapping[file_name]
		const generator = fourtune_session.autogenerate[generator_fn]

		fourtune_session.autogenerate.addFile(
			async_file_name, generator(source, "async")
		)

		fourtune_session.autogenerate.addFile(
			sync_file_name, generator(source, "sync")
		)
	}
}
