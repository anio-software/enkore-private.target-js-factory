import getFilesToAutogenerate from "./getFilesToAutogenerate.mjs"

export default async function(fourtune_session) {
	const mapping = {}

	const files = await getFilesToAutogenerate(fourtune_session)

	for (const file in files) {
		mapping[file] = [
			"generateSyncAsyncVariantFromString",
			files[file]
		]
	}

	mapping[`Implementation<X>DocType.d.mts`] = [
		"generateSyncAsyncVariant",
		`template/ImplementationDocType.d.mts`
	]

	mapping[`implementation<X>.mts`] = [
		"generateSyncAsyncVariant",
		`template/implementation.mts`
	]

	for (const file_name in mapping) {
		const async_file_name = file_name.split("<X>").join("")
		const sync_file_name = file_name.split("<X>").join("Sync")

		const [generator_fn, source] = mapping[file_name]
		const generator = fourtune_session.autogenerate[generator_fn]

		fourtune_session.autogenerate.addFile(
			async_file_name, {
				generator: generator(source, "async"),
				generator_args: []
			}
		)

		fourtune_session.autogenerate.addFile(
			sync_file_name, {
				generator: generator(source, "sync"),
				generator_args: []
			}
		)
	}
}
