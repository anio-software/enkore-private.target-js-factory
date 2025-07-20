import type {APIContext} from "./APIContext.ts"
import type {
	EnkoreSessionAPI
} from "@anio-software/enkore-private.spec"
import type {InternalData} from "./InternalData.ts"
import {getInternalData} from "./getInternalData.ts"
import {getModuleGuarded} from "./getModuleGuarded.ts"
import {getExportsNamingPolicyExemptions} from "./getExportsNamingPolicyExemptions.ts"
import type {MyTSExport} from "@anio-software/enkore-private.target-js-toolchain_types"
import {resolveImportSpecifierFromProjectRoot} from "@anio-software/enkore-private.spec/utils"
import path from "node:path"

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

function checkExportAgainstDefaultNamingPolicy(
	exportName: string,
	relativeFilePath: string,
	descriptor: MyTSExport
): boolean {
	const fileNameIndicatesTypeExport: boolean = (() => {
		// .tsx files are always value based and never a type
		if (relativeFilePath.endsWith(".tsx")) {
			return false
		}

		// uppercase letter indicates a type export
		return startsWithUpperCaseLetter(stripLeadingUnderscores(exportName))
	})()

	return fileNameIndicatesTypeExport === descriptor.isTypeOrTypeLike
}

type EntryPoints = InternalData["entryPoints"]

export async function buildEntryPointsMap(
	apiContext: APIContext,
	session: EnkoreSessionAPI
): Promise<EntryPoints> {
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
				exports: new Map(),
				localEmbeds: "none",
				remoteEmbeds: new Map(),
				exportsNamingPolicyExemptions: getExportsNamingPolicyExemptions(
					apiContext, session, exportPath
				)
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
			const exportDescriptor = mod.getModuleExportByName(exportName)

			if (!exportDescriptor) {
				session.enkore.emitMessage(
					"error",
					"missingExport",
					`${file.relativePath}: symbol/type '${exportName}' was not exported`
				)

				return
			}

			const matchesNamingPolicy = checkExportAgainstDefaultNamingPolicy
			const isExemptFromNamingPolicy = entryPoint.exportsNamingPolicyExemptions.has(
				file.fileName
			)

			if (
			    !matchesNamingPolicy(exportName, file.relativePath, exportDescriptor) &&
			    !isExemptFromNamingPolicy) {
				session.enkore.emitMessage(
					"error",
					`${file.relativePath}: export '${exportName}' violates default naming policy.`
				)

				return
			} else if (isExemptFromNamingPolicy) {
				session.enkore.emitMessage(
					"info",
					`${file.relativePath}: file is exempt from default naming policy.`
				)
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
