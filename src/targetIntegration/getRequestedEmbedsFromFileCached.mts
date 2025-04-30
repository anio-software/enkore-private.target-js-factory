import type {APIContext} from "./APIContext.mts"
import type {EnkoreSessionAPI} from "@enkore/spec"
import type {RequestedEmbedsFromCodeResult} from "@enkore-types/target-js-toolchain"
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

	const toolchain = getTargetDependency(session, "@enkore/target-js-toolchain")

	const result = await toolchain.getRequestedEmbedsFromCode(
		enkoreProjectModuleSpecifiers,
		enkoreProjectGetEmbedProperties,
		await readFileString(filePath)
	)

	cache.set(filePath, result)

	return result
}
