import path from "node:path"
import {
	isExpandableFilePath,
	expandAsyncSyncVariantFilePath,
	expandAsyncSyncVariantSourceFile
} from "@fourtune/js-and-web-runtime-and-rollup-plugins/v0/utils-api"

export async function preInitializeGenericProject(
	fourtune_session, source_files
) {
	const asyncSyncGeneratorFactory = function(src_file, variant) {
		return function (fourtune_session) {
			return expandAsyncSyncVariantSourceFile(
				path.join(fourtune_session.getProjectRoot(), src_file), variant
			)
		}
	}

	for (const src of source_files) {
		if (!isExpandableFilePath(src.name)) continue

		const [
			async_file_name,
			sync_file_name
		] = expandAsyncSyncVariantFilePath(src.name)

		fourtune_session.autogenerate.addSyntheticFile(
			"async.sync",
			path.join(
				path.dirname(src.source), async_file_name
			), asyncSyncGeneratorFactory(src.source, "async")
		)

		fourtune_session.autogenerate.addSyntheticFile(
			"async.sync",
			path.join(
				path.dirname(src.source), sync_file_name
			), asyncSyncGeneratorFactory(src.source, "sync")
		)
	}
}
