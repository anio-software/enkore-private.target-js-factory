import path from "node:path"
import {getType, expandAsyncSyncVariantName} from "../../../../expandAsyncSyncVariantName.mjs"

export async function preInitializeGenericProject(
	fourtune_session, source_files
) {
	for (const src of source_files) {
		const type = getType(src.name)

		if (!type) continue

		const [
			async_name,
			sync_name
		] = expandAsyncSyncVariantName(src.name)

		const async_file_name = `${async_name}.${type}`
		const sync_file_name = `${sync_name}.${type}`

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
