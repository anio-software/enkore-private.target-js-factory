import runBundler from "./../../../../fn/bundler/index.mjs"

export default async function(fourtune_session, file_path, entry_point, minified = false) {
	return await runBundler(
		fourtune_session, {
			entry: entry_point,
			minified
		}
	)
}
