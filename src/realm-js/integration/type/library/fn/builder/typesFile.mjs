import runBundler from "./../../../../fn/bundler/index.mjs"

export default async function(fourtune_session) {
	return await runBundler(
		fourtune_session, {
			entry: "build/src/index.d.ts"
		}
	)
}
