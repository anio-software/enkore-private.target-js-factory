import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec";
import type {APIContext} from "./APIContext.ts";
import type {RequestedEmbedsFromCodeResult} from "@anio-software/enkore-private.target-js-toolchain_types"
import type {RemoteEmbed} from "./InternalData.ts"
import {getRequestedEmbedsFromProjectSourceFile} from "./getRequestedEmbedsFromProjectSourceFile.ts"
import {getModuleGuarded} from "./getModuleGuarded.ts"
import {getInternalData} from "./getInternalData.ts"
import {readEntityJSONFile} from "@anio-software/enkore-private.spec"
import {resolveImportSpecifierFromProjectRoot} from "@anio-software/enkore-private.spec/utils"
import {parseModuleSpecifier} from "@anio-software/pkg.js-utils"
import {isString, isUndefined} from "@anio-software/pkg.is"
import path from "node:path"

type Ret = {
	local: RequestedEmbedsFromCodeResult[]
	remote: Record<string, RemoteEmbed>
}

async function getNeededEmbedsForExternalImport(
	session: EnkoreSessionAPI,
	moduleSpecifier: string
) {
	const parsed = parseModuleSpecifier(moduleSpecifier)
	const packageName: string = (() => {
		if (isString(parsed.scope)) {
			return `@${parsed.scope}/${parsed.packageName}`
		}

		return parsed.packageName
	})()

	const packageImportPath: string = (() => {
		if (isUndefined(parsed.packageImportPath)) {
			return "default"
		}

		return parsed.packageImportPath
	})()

	try {
		// todo: resolve enkore-manifest.json instead of package.json
		const packageJSONFilePath = resolveImportSpecifierFromProjectRoot(
			session.project.root, `${packageName}/package.json`
		)

		if (!packageJSONFilePath) {
			return
		}

		const packageRoot = path.dirname(packageJSONFilePath)
		const enkoreManifestFilePath = path.join(packageRoot, "enkore-manifest.json")
		const enkoreManifest = await readEntityJSONFile(enkoreManifestFilePath, "EnkoreJSBuildManifestFile")

		if (!(packageImportPath in enkoreManifest.exports)) {
			session.enkore.emitMessage(
				"error", `unable to find '${packageImportPath}' in enkore-manifest.json file.`
			)

			return
		}

		const {embeds} = enkoreManifest.exports[packageImportPath]

		return embeds
	} catch {}

	return false
}

export async function getRequestedEmbedsFromProjectSourceFileRecursive(
	apiContext: APIContext,
	session: EnkoreSessionAPI,
	sourceFilePath: string
): Promise<Ret> {
	const ret: Ret = {
		local: [],
		remote: {}
	}

	const mod = getModuleGuarded(
		getInternalData(session).myTSProgram,
		`build/${sourceFilePath}`
	)

	const filesToAnalyze: Set<string> = new Set()

	for (const moduleSpecifier of mod.referencedModuleSpecifiers) {
		if (moduleSpecifier.startsWith("build/")) {
			filesToAnalyze.add(moduleSpecifier.slice("build/".length))
		} else if (moduleSpecifier.startsWith("external:")) {
			const rawModuleSpecifier = moduleSpecifier.slice("external:".length)

			const result = await getNeededEmbedsForExternalImport(
				session, rawModuleSpecifier
			)

			if (result === false) continue

			for (const k in result) {
				ret.remote[k] = result[k]
			}
		}
	}

	filesToAnalyze.add(mod.filePath.slice("build/".length))

	for (const [filePath] of filesToAnalyze.entries()) {
		ret.local.push(
			await getRequestedEmbedsFromProjectSourceFile(
				apiContext, session, filePath
			)
		)
	}

	return ret
}
