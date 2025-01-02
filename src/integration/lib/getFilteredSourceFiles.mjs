import {isExpandableFilePath} from "@fourtune/js-and-web-runtime-and-rollup-plugins/v0/utils-api"

export function getFilteredSourceFiles(fourtuneSession) {
	let files = []

	for (const file of fourtuneSession.input.getSourceFiles()) {
		//
		// We only accept .mts files. However, this does not
		// include .d.mts files.
		//
		if (!file.source.endsWith(".mts")) {
			// todo: implement warning
		} else if (file.source.endsWith(".d.mts")) {
			// todo: implement warning
			continue
		}

		// Ignore async/sync variant files (ends with ".as.mts")
		// These are handled separately in preInitialize()
		if (isExpandableFilePath(file.name)) continue

		files.push(file)
	}

	return files
}
