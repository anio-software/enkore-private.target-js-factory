import type {
	EnkoreSessionAPI
} from "@enkore/spec"
import path from "node:path"
import type {InternalData} from "./InternalData.d.mts"
import {getInternalData} from "./getInternalData.mts"
import {getRealmDependency} from "./getRealmDependency.mts"

function startsWithUpperCaseLetter(str: string) {
	return str.toUpperCase().slice(0, 1) === str.slice(0, 1)
}

type EntryPointMap = InternalData["entryPointMap"]

export function buildEntryPointMap(
	session: EnkoreSessionAPI
): EntryPointMap {
	const exportProjectFiles = session.enkore.getProjectFiles("export")
	const map: InternalData["entryPointMap"] = new Map()
	const nodeMyTS = getRealmDependency(session, "@aniojs/node-my-ts")

	for (const file of exportProjectFiles) {
		if (!file.fileName.endsWith(".mts")) continue

		const paths = path.dirname(file.relativePath).split("/").slice(1)
		const exportPath = paths.length ? paths.join("/") : "default"

		if (!map.has(exportPath)) {
			map.set(exportPath, new Map())
		}

		const exportMap = map.get(exportPath)!

		// i wonder if this works if the file has a type error??
		const {program: myProg} = nodeMyTS.createProgram(
			session.project.root,
			[file.absolutePath],
			getInternalData(session).myTSProgram.compilerOptions
		)

		const mod = myProg.getModule(file.absolutePath)

		//
		// handle special case "__aggregatedExports"
		//
		if (file.fileName === "__aggregatedExports.mts") {
			for (const exportName of mod.getModuleExportNames()) {
				addExport(exportName)
			}
		} else {
			addExport(file.fileName.slice(0, -4))

			if (mod.getModuleExportNames().length > 1) {
				session.enkore.emitMessage(
					"warning",
					"multipleExports",
					`${file.relativePath}: exports multiple symbols`
				)
			}
		}

		function addExport(exportName: string) {
			const exportIndicatesTypeExport = startsWithUpperCaseLetter(exportName)

			const exportDescriptor = mod.getModuleExportByName(
				exportName, exportIndicatesTypeExport
			)

			if (!exportDescriptor) {
				const typeStr = exportIndicatesTypeExport ? "type " : ""

				session.enkore.emitMessage(
					"error",
					"missingExport",
					`${file.relativePath}: ${typeStr}symbol '${exportName}' was not exported`
				)

				return
			}

			// we know file ends with ".mts"
			const extensionlessSource = file.relativePath.slice(0, -4)

			exportMap.set(exportName, {
				name: exportName,
				descriptor: exportDescriptor,
				relativePath: file.relativePath,
				pathToJsFile: `objects/${extensionlessSource}.mjs`,
				pathToDtsFile: `objects/${extensionlessSource}.d.mts`
			})
		}
	}

	return map
}
