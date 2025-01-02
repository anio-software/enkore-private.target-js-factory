import {isExpandableFilePath} from "@fourtune/js-and-web-runtime-and-rollup-plugins/v0/utils-api"

function getExportTypeAndName(filename) {
	if (filename.endsWith(".d.mts")) {
		return {
			type: "d.mts",
			name: filename.slice(0, -6)
		}
	} else if (filename.endsWith(".mts")) {
		return {
			type: "mts",
			name: filename.slice(0, -4)
		}
	}

	return false
}

function removeExtension(source, type) {
	return source.slice(0, -(`.${type}`.length))
}

export function getEntryPointMap(fourtune_session) {
	const entryPointMap = new Map()

	for (const source of fourtune_session.input.getSourceFiles()) {
		if (!source.parents.length) continue
		if (source.parents[0] !== "export") continue
		// ignore .as.mts and .as.d.mts files
		if (isExpandableFilePath(source.name)) continue

		const parsed = getExportTypeAndName(source.name)

		if (!parsed) continue

		source.parents = source.parents.slice(1)

		const exportName = parsed.name
		const extensionlessSource = removeExtension(source.source, parsed.type)
		const entryPointName = source.parents.length ? source.parents.join(".") : "default"

		if (!entryPointMap.has(entryPointName)) {
			entryPointMap.set(entryPointName, new Map())
		}

		const entryPointExportMap = entryPointMap.get(entryPointName)

		if (entryPointExportMap.has(exportName)) {
			const using = entryPointExportMap.get(exportName).source

			fourtune_session.emitWarning(
				`pkg.duplicate_export`, {
					entryPointName, exportName, using
				}
			)
		} else {
			entryPointExportMap.set(exportName, {
				source: source.source,
				extensionlessSource,
				type: parsed.type,
				name: parsed.name
			})
		}
	}

	return entryPointMap
}
