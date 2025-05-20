import type {APIContext} from "./APIContext.mts"
import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {RequestedEmbedsFromCodeResult} from "@anio-software/enkore-private.target-js-toolchain_types"
import {readFileString} from "@aniojs/node-fs"
import {getInternalData} from "./getInternalData.mts"

export async function getRequestedEmbedsFromFileCached(
	apiContext: APIContext,
	session: EnkoreSessionAPI,
	filePath: string
): Promise<RequestedEmbedsFromCodeResult> {
	const cache = getInternalData(session).requestedEmbedsFileCache

	if (cache.has(filePath)) {
		return cache.get(filePath)!
	}

	const enkoreProjectModuleSpecifiers = [
		`@enkore-target/${apiContext.target}/project`
	]

	const enkoreProjectGetEmbedProperties = [
		"getEmbedAsString",
		"getEmbedAsUint8Array",
		"getEmbedAsURL"
	]

	const toolchain = session.target._getToolchain("js")

	const result = await toolchain.getRequestedEmbedsFromCode(
		enkoreProjectModuleSpecifiers,
		enkoreProjectGetEmbedProperties,
		await readFileString(filePath)
	)

	cache.set(filePath, result)

	return result
}
