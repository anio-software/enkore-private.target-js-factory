import type {InternalData} from "./InternalData.ts"
import {
	type EnkoreJSBuildManifestFile,
	type EnkoreSessionAPI,
	createEntity
} from "@anio-software/enkore-private.spec"
import {parseEmbedURL} from "@anio-software/enkore-private.spec/utils"

export function getEnkoreManifestFileData(
	session: EnkoreSessionAPI,
	entryPoints: InternalData["entryPoints"]
) {
	const {packageJSON} = session.project
	const exp: EnkoreJSBuildManifestFile["exports"] = {}

	for (const [entryPointPath, entryPoint] of entryPoints.entries()) {
		if (entryPoint.embeds === "none") continue

		exp[entryPointPath] = {
			embeds: {}
		}

		for (const [embedURL, {createResourceAtRuntimeInit}] of entryPoint.embeds.entries()) {
			const {protocol, path} = parseEmbedURL(embedURL)

			const globalIdentifier = `${packageJSON.name}/v${packageJSON.version}/${protocol}/${path}`

			exp[entryPointPath].embeds[globalIdentifier] = {
				createResourceAtRuntimeInit,
				integrity: ""
			}
		}
	}

	return createEntity("EnkoreJSBuildManifestFile", 0, 0, {
		exports: exp
	})
}
