import runBundler from "./../../../../fn/bundler/index.mjs"

export default async function(fourtune_session, file_path, minified = false) {
	return await runBundler(
		fourtune_session, {
			entry: "build/src/auto/library.mjs",
			minified
		}
	)
}
