import type {APIContext} from "./APIContext.ts"
import type {
	EnkoreSessionAPI,
	EnkoreJSRuntimeProjectAPIContext
} from "@anio-software/enkore-private.spec"
import type {RequestedEmbedsFromCodeResult} from "@anio-software/enkore-private.target-js-toolchain_types"
import {getRequestedEmbedsFromProjectSourceFileRecursive} from "./getRequestedEmbedsFromProjectSourceFileRecursive.ts"
import {combineRequestedEmbedsFromCodeResults} from "./combineRequestedEmbedsFromCodeResults.ts"
import {getInternalData} from "./getInternalData.ts"
import type {EmbedsMap, EntryPoint} from "./InternalData.ts"

type Embed = {
	isLocal: boolean
	url: string
	createResourceAtRuntimeInit: boolean
	size: number
}

function formatSize(size: number) {
	if (isNaN(size)) {
		return "N/A"
	}

	if (1024 > size) {
		return `${size} Bytes`
	}

	return `${(size / 1024).toFixed(2)} KiB`
}

function formatEmbedLogMessage(embed: Embed): string {
	return `    - ${embed.url}${embed.createResourceAtRuntimeInit ? " (+resource)" : ""} ${formatSize(embed.size)}`
}

function logAllEmbeds(
	session: EnkoreSessionAPI,
	entryPointPath: string,
	entryPoint: EntryPoint
) {
	const allEmbeds: Set<Embed> = new Set()
	let combinedSize = 0

	if (entryPoint.localEmbeds !== "none") {
		for (const [embedURL, embedData] of entryPoint.localEmbeds.entries()) {
			allEmbeds.add({
				isLocal: true,
				url: embedURL,
				createResourceAtRuntimeInit: embedData.createResourceAtRuntimeInit,
				size: embedData.size
			})

			combinedSize += embedData.size
		}
	}

	for (const [embedURL, embedData] of entryPoint.remoteEmbeds.entries()) {
		allEmbeds.add({
			isLocal: false,
			url: embedURL,
			createResourceAtRuntimeInit: embedData.createResourceAtRuntimeInit,
			size: NaN
		})
	}

	if (allEmbeds.size) {
		let message = `entry point '${entryPointPath}' will contain the following embeds:\n\n`

		const localEmbeds = [...allEmbeds].filter(v => v.isLocal)
		const remoteEmbeds = [...allEmbeds].filter(v => !v.isLocal)

		if (localEmbeds.length) {
			message += `  Local Embeds (${localEmbeds.length})\n\n`
		}

		message += localEmbeds.map(embed => {
			return formatEmbedLogMessage(embed)
		}).join("\n")

		if (localEmbeds.length && remoteEmbeds.length) {
			message += `\n\n`
			message += `  Remote Embeds (${remoteEmbeds.length})\n\n`
		}

		message += remoteEmbeds.map(embed => {
			return formatEmbedLogMessage(embed)
		}).join("\n")

		message += `\n\nThe combined size of all embeds is ${formatSize(combinedSize)}`

		session.enkore.emitMessage("info", message)
	}
}

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
			for (const [embedURL, {data}] of projectEmbedMap.entries()) {
				embedsMap.set(embedURL, {
					createResourceAtRuntimeInit: true,
					size: data.length
				})
			}
		} else {
			const usedEmbeds = result[1]

			for (const [embedURL, {data}] of projectEmbedMap.entries()) {
				if (!usedEmbeds.has(embedURL)) continue

				const {requestedByMethods} = usedEmbeds.get(embedURL)!

				embedsMap.set(embedURL, {
					createResourceAtRuntimeInit: requestedByMethods.has("getEmbedAsURL"),
					size: data.length
				})
			}
		}

		entryPoint.localEmbeds = embedsMap

		if (result[0] === "all") {
			session.enkore.emitMessage("warning", `entry point '${entryPointPath}' will contain ALL local embeds!`)
		}

		logAllEmbeds(session, entryPointPath, entryPoint)
	}
}
