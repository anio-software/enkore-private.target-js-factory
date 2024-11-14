import path from "node:path"

export async function preInitializeGenericProject(
	fourtune_session, source_files
) {
	for (const src of source_files) {
		if (!(src.name.endsWith(".as.mts"))) continue

		const async_file_name = src.name.slice(0, -7).split("XXX").join("") + ".mts"
		const sync_file_name = src.name.slice(0, -7).split("XXX").join("Sync") + ".mts"

		const generator = fourtune_session.autogenerate[
			"generateAsyncSyncVariant"
		]

		fourtune_session.autogenerate.addUserFile(
			path.join(
				path.dirname(src.source), async_file_name
			), generator(src.source, "async")
		)

		fourtune_session.autogenerate.addUserFile(
			path.join(
				path.dirname(src.source), sync_file_name
			), generator(src.source, "sync")
		)
	}
}
