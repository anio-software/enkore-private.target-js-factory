import {isExpandableFileName, isExpandableName} from "../../../expandAsyncSyncVariantName.mjs"
import {_generateAsyncSyncFactoryFiles} from "./_generateAsyncSyncFactoryFiles.mjs"
import {_generateFactoryFiles} from "./_generateFactoryFiles.mjs"
import path from "node:path"

function appendSrc(files) {
	let ret = {}

	for (const file in files) {
		ret[path.join("src", file)] = files[file]
	}

	return ret
}

/*
input object:

	source_file: "src/bla.mts",
	export_name: "blaBla",
	destination: "src/export/"
*/
export function generateFactoryFiles(
	options
) {
	const required_options = ["source_file", "export_name", "destination"]

	for (const o of required_options) {
		if (!(o in options)) {
			throw new Error(`Required option '${o}' not set.`)
		}
	}

	if (!options.source_file.startsWith("src/")) {
		throw new Error(`source file must be inside src/.`)
	} else if (!options.destination.startsWith("src/")) {
		throw new Error(`destination must start with src/.`)
	}

	let files = {}

	//
	// if input source file is an async/sync variant file
	// export_name **must** also be expandable
	//
	if (isExpandableFileName(options.source_file)) {
		if (!isExpandableName(options.export_name)) {
			throw new Error(
				`Cannot have async/sync variant source without expandable export_name.`
			)
		}

		files = _generateAsyncSyncFactoryFiles(options)
	} else {
		files = _generateFactoryFiles(options)
	}

	return appendSrc(files)
}
