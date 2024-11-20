import {getPaths} from "./getPaths.mjs"

export function _generateAsyncSyncFactoryFiles(
	options
) {
	let ret = {}

	const [async_paths, sync_paths] = getPaths(options)

	ret[async_paths.output.fn] = () => ""
	ret[sync_paths.output.fn] = () => ""

	ret[async_paths.output.factory] = () => ""
	ret[sync_paths.output.factory] = () => ""

	return ret
}
