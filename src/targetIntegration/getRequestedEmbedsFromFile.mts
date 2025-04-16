import type {APIContext} from "./APIContext.mts"
import type {EnkoreSessionAPI} from "@enkore/spec"
import type {RequestedEmbedsFromCodeResult} from "@enkore-types/babel"
import {readFileString} from "@aniojs/node-fs"
import {getInternalData} from "./getInternalData.mts"
import {getTargetDependency} from "./getTargetDependency.mts"

export async function getRequestedEmbedsFromFile(
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

	const babel = getTargetDependency(session, "@enkore/babel")

	const result = await babel.getRequestedEmbedsFromCode(
		enkoreProjectModuleSpecifiers,
		enkoreProjectGetEmbedProperties,
		await readFileString(filePath)
	)

	cache.set(filePath, result)

	return result
}
