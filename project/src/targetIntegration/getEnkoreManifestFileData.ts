import type {InternalData} from "./InternalData.ts"
import {
	type EnkoreJSBuildManifestFile,
	type EnkoreSessionAPI,
	createEntity,
	parseEmbedURL
} from "@anio-software/enkore-private.spec"

export function getEnkoreManifestFileData(
	session: EnkoreSessionAPI,
	entryPoints: InternalData["entryPoints"]
) {
	const {packageJSON} = session.project
	const exp: EnkoreJSBuildManifestFile["exports"] = {}

	for (const [entryPointPath, entryPoint] of entryPoints.entries()) {
		exp[entryPointPath] = {
			embeds: {}
		}

		if (entryPoint.localEmbeds === "none") continue

		for (const [embedURL, {size, createResourceAtRuntimeInit}] of entryPoint.localEmbeds.entries()) {
			const {protocol, path} = parseEmbedURL(embedURL)

			const globalIdentifier = `${packageJSON.name}/v${packageJSON.version}/${protocol}/${path}`

			exp[entryPointPath].embeds[globalIdentifier] = {
				sourceFilePath: path,
				url: embedURL,
				createResourceAtRuntimeInit,
				integrity: "",
				size
			}
		}
	}

	return createEntity("EnkoreJSBuildManifestFile", 0, 0, {
		exports: exp
	})
}
