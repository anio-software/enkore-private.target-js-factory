import type {APIContext} from "./APIContext.ts"
import type {
	EnkoreSessionAPI,
	EnkoreJSRuntimeProjectAPIContext
} from "@anio-software/enkore-private.spec"
import type {RequestedEmbedsFromCodeResult} from "@anio-software/enkore-private.target-js-toolchain_types"
import {getRequestedEmbedsFromProjectSourceFileRecursive} from "./getRequestedEmbedsFromProjectSourceFileRecursive.ts"
import {combineRequestedEmbedsFromCodeResults} from "./combineRequestedEmbedsFromCodeResults.ts"
import {getInternalData} from "./getInternalData.ts"
import type {EmbedsMap} from "./InternalData.ts"

export async function updateEntryPointsMap(
	apiContext: APIContext,
	projectAPIContext: EnkoreJSRuntimeProjectAPIContext,
	session: EnkoreSessionAPI
) {
	const entryPoints = getInternalData(session).entryPoints
	const projectEmbedMap = projectAPIContext._projectEmbedFileMapRemoveMeInBundle!

	for (const [entryPointPath, entryPoint] of entryPoints.entries()) {
		const aggregatedResult: RequestedEmbedsFromCodeResult[] = []

		for (const [, {relativePath}] of entryPoint.exports.entries()) {
			const result = await getRequestedEmbedsFromProjectSourceFileRecursive(
				apiContext, session, relativePath
			)

			result.local.forEach(r => aggregatedResult.push(r))

			for (const globalIdentifier in result.remote) {
				const remoteEmbed = result.remote[globalIdentifier]

				// NB: prevent 'createResourceAtRuntimeInit' from being overwritten to 'false'
				if (entryPoint.remoteEmbeds.has(globalIdentifier)) {
					const tmp = entryPoint.remoteEmbeds.get(globalIdentifier)!

					if (tmp.createResourceAtRuntimeInit) continue
				}

				entryPoint.remoteEmbeds.set(globalIdentifier, remoteEmbed)
			}
		}

		const result = combineRequestedEmbedsFromCodeResults(aggregatedResult)

		if (result[0] === "none") {
			entryPoint.localEmbeds = "none"

			continue
		}

		const embedsMap: EmbedsMap = new Map()

		if (result[0] === "all") {
			for (const [embedURL] of projectEmbedMap.entries()) {
				embedsMap.set(embedURL, {
					createResourceAtRuntimeInit: true
				})
			}

			session.enkore.emitMessage("warning", `entry point '${entryPointPath}' will contain ALL embeds!`)
		} else {
			const usedEmbeds = result[1]

			for (const [embedURL] of projectEmbedMap.entries()) {
				if (!usedEmbeds.has(embedURL)) continue

				const {requestedByMethods} = usedEmbeds.get(embedURL)!

				embedsMap.set(embedURL, {
					createResourceAtRuntimeInit: requestedByMethods.has("getEmbedAsURL")
				})
			}
		}

		if (embedsMap.size) {
			let message = `entry point '${entryPointPath}' will contain the following embeds:\n`

			for (const [embedPath, {createResourceAtRuntimeInit}] of embedsMap.entries()) {
				message += ` - ${embedPath}`

				if (createResourceAtRuntimeInit) {
					message += ` (create resource at runtime init)`
				}

				message += `\n`
			}

			session.enkore.emitMessage("info", message.slice(0, -1))
		}

		entryPoint.localEmbeds = embedsMap
	}
}
