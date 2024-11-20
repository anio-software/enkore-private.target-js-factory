import {expandAsyncSyncVariantFilePath, expandAsyncSyncVariantNew, isExpandableFileName} from "../../../expandAsyncSyncVariantName.mjs"
import path from "node:path"

export function getPaths(
	options, _auto_src = false
) {
	if (!isExpandableFileName(options.source_file)) {
		const source = path.normalize(
			path.join(_auto_src ? "#~auto" : "#~src", options.source_file.slice(4))
		)

		const output = {
			fn: path.normalize(
				path.join(
				//	"#~auto",
					options.destination.slice(4),
					`${options.export_name}.mts`
				)
			),

			factory: path.normalize(
				path.join(
				//	"#~auto",
					options.destination.slice(4),
					`${options.export_name}Factory.mts`
				)
			)
		}

		return {source, output}
	}

	const [async_source_file, sync_source_file] = expandAsyncSyncVariantFilePath(
		options.source_file
	)

	const [async_export_name, sync_export_name] = expandAsyncSyncVariantNew(
		options.export_name
	)

	return [
		getPaths({
			source_file: async_source_file,
			export_name: async_export_name,
			destination: options.destination
		}, true),

		getPaths({
			source_file: sync_source_file,
			export_name: sync_export_name,
			destination: options.destination
		}, true)
	]
}
