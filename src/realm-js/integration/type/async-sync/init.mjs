import getFilesToAutogenerate from "./getFilesToAutogenerate.mjs"

export default async function(fourtune_session) {
	const mapping = {}

	const files = await getFilesToAutogenerate(fourtune_session)

	for (const file in files) {
		mapping[file.split("<X>").join("")] = [
			"generateSyncAsyncVariantFromString",
			files[file],
			"async"
		]

		mapping[file.split("<X>").join("Sync")] = [
			"generateSyncAsyncVariantFromString",
			files[file],
			"sync"
		]
	}

	mapping[`ImplementationDocType.d.mts`] = [
		"generateSyncAsyncVariant",
		`template/ImplementationDocType.d.mts`,
		"async"
	]

	mapping[`ImplementationSyncDocType.d.mts`] = [
		"generateSyncAsyncVariant",
		`template/ImplementationDocType.d.mts`,
		"sync"
	]

	mapping[`implementation.mts`] = [
		"generateSyncAsyncVariant",
		`template/implementation.mts`,
		"async"
	]

	mapping[`implementationSync.mts`] = [
		"generateSyncAsyncVariant",
		`template/implementation.mts`,
		"sync"
	]

	for (const file_name in mapping) {
		const [generator_fn, source, variant] = mapping[file_name]

		fourtune_session.autogenerate.addFile(
			file_name, {
				generator:fourtune_session.autogenerate[generator_fn](
					source, variant
				),
				generator_args: []
			}
		)
	}
}
