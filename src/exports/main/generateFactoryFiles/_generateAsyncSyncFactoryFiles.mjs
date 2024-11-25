import {getPaths} from "./getPaths.mjs"
import {_generateFunctionCode} from "./_generateFunctionCode.mjs"
import {_generateFactoryCode} from "./_generateFactoryCode.mjs"
import {expandAsyncSyncVariantNew} from "../../../expandAsyncSyncVariantName.mjs"
import path from "node:path"

function generateFactoryFileFactory(options, paths, variant) {
	return async (fourtune_session) => {
		const {generateAsyncSyncVariant} = fourtune_session.autogenerate

		// NB: we must create our own version of async/sync
		// since we would be potentially using outdated code
		// (e.g. if we read the code from the file system (auto/src/ folder))
		const generate = generateAsyncSyncVariant(options.source_file)
		const source = await  generate(fourtune_session, variant)
		const base = await fourtune_session.getDependency("@fourtune/base-realm-js-and-web")

		const {
			tsGenerateFunctionFactoryCode
		} = base

		return await tsGenerateFunctionFactoryCode(
			paths.source,
			path.basename(paths.output.factory).slice(0, -4),
			path.basename(paths.output.fn).slice(0, -4),
			source
		)
	}
}

export function _generateAsyncSyncFactoryFiles(
	options
) {
	let ret = {}

	const [async_paths, sync_paths] = getPaths(options)
	const [async_export_name, sync_export_name] = expandAsyncSyncVariantNew(
		options.export_name
	)

	ret[async_paths.output.fn] = () => _generateFunctionCode(
		path.join("#~auto", async_paths.output.factory),
		async_paths.source,
		async_export_name
	)

	ret[sync_paths.output.fn] = () => _generateFunctionCode(
		path.join("#~auto", sync_paths.output.factory),
		sync_paths.source,
		sync_export_name
	)

	ret[async_paths.output.factory] = generateFactoryFileFactory(
		options, async_paths, "async"
	)

	ret[sync_paths.output.factory] = generateFactoryFileFactory(
		options, sync_paths, "sync"
	)

	return ret
}
