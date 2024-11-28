import path from "node:path"
import {isExpandableFilePath, expandAsyncSyncVariantFilePath} from "@fourtune/js-and-web-runtime-and-rollup-plugins/v0/utils-api"
import {generateAsyncSyncVariant} from "@fourtune/js-and-web-runtime-and-rollup-plugins/v0/autogenerate-api"

export async function preInitializeGenericProject(
	fourtune_session, source_files
) {
	for (const src of source_files) {
		if (!isExpandableFilePath(src.name)) continue

		const [
			async_file_name,
			sync_file_name
		] = expandAsyncSyncVariantFilePath(src.name)

		fourtune_session.autogenerate.addUserFile(
			path.join(
				path.dirname(src.source), async_file_name
			), generateAsyncSyncVariant(src.source, "async")
		)

		fourtune_session.autogenerate.addUserFile(
			path.join(
				path.dirname(src.source), sync_file_name
			), generateAsyncSyncVariant(src.source, "sync")
		)
	}
}
