import {readEntityJSONFile} from "@anio-software/enkore-private.spec"
import type {EntryPoint} from "./InternalData.ts"
import {isFileSync, findNearestFileSync, readFileString} from "@anio-software/pkg.node-fs"
import {_parseJSRuntimeInitHeader} from "./_parseJSRuntimeInitHeader.ts"
import path from "node:path"

export async function _rollupDependencyLoader(id: string): Promise<null|{
	codeWithRuntimeCodeStripped: string
	embeds: EntryPoint["embeds"]
}> {
	if (!isFileSync(id)) {
		return null
	}

	const embeds: EntryPoint["embeds"] = new Map()

	const enkoreManifestFilePath = findNearestFileSync(
		"enkore-manifest.json", path.dirname(id)
	)

	if (!enkoreManifestFilePath) {
		return null
	}

	const entryPointPath = path.relative(
		path.join(
			path.dirname(enkoreManifestFilePath),
			"dist"
		), path.dirname(id)
	)

	const manifest = await readEntityJSONFile(
		enkoreManifestFilePath, "EnkoreJSBuildManifestFile"
	)

	if (!(entryPointPath in manifest.exports)) {
		throw new Error(`fatal error, couldn't find "${entryPointPath}" in manifest file '${enkoreManifestFilePath}'.`)
	}

	for (const embed of manifest.exports[entryPointPath].embeds) {
		embeds.set(
			embed.identifier, {
				createResourceAtRuntimeInit: embed.createResourceAtRuntimeInit
			}
		)
	}

	const code = await readFileString(id)
	const runtimeHeader = _parseJSRuntimeInitHeader(code)

	if (runtimeHeader === false) {
		throw new Error(`Failed to parse runtime init header.`)
	}

	return {
		codeWithRuntimeCodeStripped: code.slice(runtimeHeader.offset),
		embeds
	}
}
