import {getPaths} from "./getPaths.mjs"
import {_generateFunctionCode} from "./_generateFunctionCode.mjs"
import {expandAsyncSyncVariantNew} from "../../../expandAsyncSyncVariantName.mjs"
import path from "node:path"

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

	ret[async_paths.output.factory] = () => ""
	ret[sync_paths.output.factory] = () => ""

	return ret
}
