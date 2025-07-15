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
	} else if (1024 * 1024 > size) {
		return `${(size / 1024).toFixed(2)} KiB`
	}

	return `${(size / 1024 / 1024).toFixed(2)} MiB`
}

function formatEmbedLogMessage(embed: Embed): string {
	return `    - ${embed.url}${embed.createResourceAtRuntimeInit ? " (+resourceURL)" : ""} ${formatSize(embed.size)}`
}

function calcEmbedsSize(embeds: Embed[]) {
	let total = 0

	for (const {size} of embeds) {
		if (isNaN(size)) continue

		total += size
	}

	return formatSize(total)
}

function nEmbedsString(n: number) {
	return (n === 1) ? "1 embed" : `${n} embeds`
}

function logAllEmbeds(
	session: EnkoreSessionAPI,
	entryPointPath: string,
	entryPoint: EntryPoint
) {
	const allEmbeds: Set<Embed> = new Set()

	if (entryPoint.localEmbeds !== "none") {
		for (const [embedURL, embedData] of entryPoint.localEmbeds.entries()) {
			allEmbeds.add({
				isLocal: true,
				url: embedURL,
				createResourceAtRuntimeInit: embedData.createResourceAtRuntimeInit,
				size: embedData.size
			})
		}
	}

	for (const [embedURL, embedData] of entryPoint.remoteEmbeds.entries()) {
		allEmbeds.add({
			isLocal: false,
			url: embedURL,
			createResourceAtRuntimeInit: embedData.createResourceAtRuntimeInit,
			size: embedData.size
		})
	}

	const allEmbedsAsArray = [...allEmbeds]

	if (allEmbedsAsArray.length) {
		let message = `entry point '${entryPointPath}' will contain the following embeds:\n\n`

		const localEmbeds = allEmbedsAsArray.filter(v => v.isLocal)
		const remoteEmbeds = allEmbedsAsArray.filter(v => !v.isLocal)

		if (localEmbeds.length) {
			message += `  Local Embeds (${nEmbedsString(localEmbeds.length)}, total size ${calcEmbedsSize(localEmbeds)})\n\n`
		}

		message += localEmbeds.map(embed => {
			return formatEmbedLogMessage(embed)
		}).join("\n")

		if (localEmbeds.length && remoteEmbeds.length) {
			message += `\n\n`
			message += `  Remote Embeds (${nEmbedsString(remoteEmbeds.length)}, total size ${calcEmbedsSize(remoteEmbeds)})\n\n`
		}

		message += remoteEmbeds.map(embed => {
			return formatEmbedLogMessage(embed)
		}).join("\n")

		message += `\n\nThe combined size of all embeds is ${calcEmbedsSize(allEmbedsAsArray)}.`

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
