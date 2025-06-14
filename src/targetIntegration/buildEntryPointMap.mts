import type {
	EnkoreSessionAPI
} from "@anio-software/enkore-private.spec"
import path from "node:path"
import type {InternalData} from "./InternalData.d.mts"
import {getInternalData} from "./getInternalData.mts"
import {getModuleGuarded} from "./getModuleGuarded.mts"

function stripLeadingUnderscores(str: string) {
	for (let i = 0; i < str.length; ++i) {
		if (str[i] !== "_") {
			return str.slice(i)
		}
	}

	return str
}

function startsWithUpperCaseLetter(str: string) {
	return str.toUpperCase().slice(0, 1) === str.slice(0, 1)
}

type EntryPointMap = InternalData["entryPointMap"]

export function buildEntryPointMap(
	session: EnkoreSessionAPI
): EntryPointMap {
	// don't create map if we are building embeds only
	if (session.enkore.getOptions()._partialBuild === true) {
		session.enkore.emitMessage(
			`debug`, `returning empty entryPointMap.`
		)

		return new Map()
	}

	const exportProjectFiles = session.enkore.getProjectFiles("export")
	const map: InternalData["entryPointMap"] = new Map()
	const {myTSProgram} = getInternalData(session)

	for (const file of exportProjectFiles) {
		if (!file.fileName.endsWith(".ts")) continue

		const paths = path.dirname(file.relativePath).split("/").slice(1)
		const exportPath = paths.length ? paths.join("/") : "default"

		if (!map.has(exportPath)) {
			map.set(exportPath, new Map())
		}

		const exportMap = map.get(exportPath)!

		//
		// NB: don't use the files inside project/* folder but the files
		// inside the build/* folder!!
		//
		const mod = getModuleGuarded(myTSProgram, path.join(
			session.project.root, "build", file.relativePath
		))

		//
		// handle special case "__aggregatedExports"
		//
		if (file.fileName === "__aggregatedExports.ts") {
			for (const exportName of mod.getModuleExportNames()) {
				addExport(exportName)
			}
		} else {
			addExport(file.fileName.slice(0, -3))

			if (mod.getModuleExportNames().length > 1) {
				session.enkore.emitMessage(
					"warning",
					"multipleExports",
					`${file.relativePath}: exports multiple symbols`
				)
			}
		}

		function addExport(exportName: string) {
			const exportIndicatesTypeExport = startsWithUpperCaseLetter(
				stripLeadingUnderscores(exportName)
			)

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

			// we know file ends with ".ts"
			const extensionlessSource = file.relativePath.slice(0, -3)

			exportMap.set(exportName, {
				name: exportName,
				descriptor: exportDescriptor,
				relativePath: file.relativePath,
				pathToJsFile: `objects/${extensionlessSource}.js`,
				pathToDtsFile: `objects/${extensionlessSource}.d.ts`
			})
		}
	}

	return map
}
