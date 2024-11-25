import {getPaths} from "./getPaths.mjs"

function generateFunctionFileFactory(options, paths, variant) {
	return async (fourtune_session) => {
		const {generateAsyncSyncVariant} = fourtune_session.autogenerate

		// NB: we must create our own version of async/sync
		// since we would be potentially using outdated code
		// (e.g. if we read the code from the file system (auto/src/ folder))
		const generate = generateAsyncSyncVariant(options.source_file, variant)
		const source = await  generate(fourtune_session, variant)
		const base = await fourtune_session.getDependency("@fourtune/base-realm-js-and-web")

		const {tsGenerateFunctionFactoryCode} = base

		const {fn} = await tsGenerateFunctionFactoryCode(
			paths,
			source,
			variant === "async"
		)

		return fn
	}
}

function generateFactoryFileFactory(options, paths, variant) {
	return async (fourtune_session) => {
		const {generateAsyncSyncVariant} = fourtune_session.autogenerate

		// NB: we must create our own version of async/sync
		// since we would be potentially using outdated code
		// (e.g. if we read the code from the file system (auto/src/ folder))
		const generate = generateAsyncSyncVariant(options.source_file, variant)
		const source = await  generate(fourtune_session, variant)
		const base = await fourtune_session.getDependency("@fourtune/base-realm-js-and-web")

		const {tsGenerateFunctionFactoryCode} = base

		const {factory} = await tsGenerateFunctionFactoryCode(
			paths,
			source,
			variant === "async"
		)

		return factory
	}
}

export function _generateAsyncSyncFactoryFiles(options) {
	let ret = {}

	const [async_paths, sync_paths] = getPaths(options)

	ret[async_paths.output.fn] = generateFunctionFileFactory(
		options, async_paths, "async"
	)

	ret[sync_paths.output.fn] = generateFunctionFileFactory(
		options, sync_paths, "sync"
	)

	ret[async_paths.output.factory] = generateFactoryFileFactory(
		options, async_paths, "async"
	)

	ret[sync_paths.output.factory] = generateFactoryFileFactory(
		options, sync_paths, "sync"
	)

	return ret
}
