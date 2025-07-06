import type {APIContext} from "./APIContext.ts"
import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {RequestedEmbedsFromCodeResult} from "@anio-software/enkore-private.target-js-toolchain_types"
import {readFileString} from "@anio-software/pkg.node-fs"
import {getInternalData} from "./getInternalData.ts"
import {getBaseModuleSpecifier} from "#~src/getBaseModuleSpecifier.ts"
import {getToolchain} from "#~src/getToolchain.ts"

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
		`${getBaseModuleSpecifier(apiContext.target)}/project`
	]

	const enkoreProjectGetEmbedProperties = [
		"getEmbedAsString",
		"getEmbedAsUint8Array",
		"getEmbedAsURL"
	]

	const toolchain = getToolchain(session)

	const result = await toolchain.getRequestedEmbedsFromCode(
		enkoreProjectModuleSpecifiers,
		enkoreProjectGetEmbedProperties,
		await readFileString(filePath)
	)

	cache.set(filePath, result)

	return result
}
