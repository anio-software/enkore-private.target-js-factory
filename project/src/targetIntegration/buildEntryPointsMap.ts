import type {
	EnkoreSessionAPI
} from "@anio-software/enkore-private.spec"
import path from "node:path"
import type {InternalData} from "./InternalData.ts"
import {getInternalData} from "./getInternalData.ts"
import {getModuleGuarded} from "./getModuleGuarded.ts"
import {resolveImportSpecifierFromProjectRoot} from "@anio-software/enkore-private.spec/utils"

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

type EntryPoints = InternalData["entryPoints"]

export function buildEntryPointsMap(
	session: EnkoreSessionAPI
): EntryPoints {
	// don't create map if we are building embeds only
	if (session.enkore.getOptions()._partialBuild === true) {
		session.enkore.emitMessage(
			`debug`, `returning empty entryPointMap.`
		)

		return new Map()
	}

	const exportProjectFiles = session.enkore.getProjectFiles("export")
	const map: InternalData["entryPoints"] = new Map()
	const {myTSProgram} = getInternalData(session)

	for (const file of exportProjectFiles) {
		const isTypeScriptFile = file.fileName.endsWith(".ts")
		const isTSXFile = file.fileName.endsWith(".tsx")

		if (!isTypeScriptFile && !isTSXFile) continue

		const cssImportMap: Map<string, 0> = new Map()
		const extensionOffset = isTSXFile ? -4 : -3

		const paths = path.dirname(file.relativePath).split("/").slice(1)
		const exportPath = paths.length ? paths.join("/") : "default"

		if (!map.has(exportPath)) {
			map.set(exportPath, {
				hasCSSImports: false,
				exports: new Map()
			})
		}

		const entryPoint = map.get(exportPath)!

		//
		// NB: don't use the files inside project/* folder but the files
		// inside the build/* folder!!
		//
		const mod = getModuleGuarded(myTSProgram, path.join(
			session.project.root, "build", file.relativePath
		))

		for (const moduleSpecifier of mod.referencedModuleSpecifiers) {
			if (moduleSpecifier.endsWith(".css.ts")) {
				// specifiers should always start with build/ here
				cssImportMap.set(
					moduleSpecifier.slice("build/".length, -3), 0
				)
			} else if (moduleSpecifier.startsWith("external:") && moduleSpecifier.endsWith(".css")) {
				const rawModuleSpecifier = moduleSpecifier.slice("external:".length)
				const resolved = resolveImportSpecifierFromProjectRoot(
					session.project.root, rawModuleSpecifier
				)

				if (resolved !== false) {
					cssImportMap.set(resolved, 0)
				}
			}
		}

		//
		// handle special case "__aggregatedExports"
		//
		if (file.fileName === "__aggregatedExports.ts") {
			for (const exportName of mod.getModuleExportNames()) {
				addExport(exportName)
			}
		} else {
			addExport(file.fileName.slice(0, extensionOffset))

			if (mod.getModuleExportNames().length > 1) {
				session.enkore.emitMessage(
					"warning",
					"multipleExports",
					`${file.relativePath}: exports multiple symbols`
				)
			}
		}

		function addExport(exportName: string) {
			const exportIndicatesTypeExport: boolean = (() => {
				//
				// .tsx files are always value based and never a type
				//
				if (isTSXFile) {
					return false
				}

				return startsWithUpperCaseLetter(stripLeadingUnderscores(exportName))
			})()

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

			const extensionlessSource = file.relativePath.slice(0, extensionOffset)

			if (cssImportMap.size) {
				entryPoint.hasCSSImports = true
			}

			entryPoint.exports.set(exportName, {
				name: exportName,
				descriptor: exportDescriptor,
				relativePath: file.relativePath,
				pathToJsFile: `objects/${extensionlessSource}.js`,
				pathToDtsFile: `objects/${extensionlessSource}.d.ts`,
				isTSXComponent: isTSXFile,
				cssImportMap
			})
		}
	}

	return map
}
