import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec";
import type {APIContext} from "./APIContext.ts";
import type {RequestedEmbedsFromCodeResult} from "@anio-software/enkore-private.target-js-toolchain_types"
import {readFileString} from "@anio-software/pkg.node-fs"
import {getBaseModuleSpecifier} from "#~src/getBaseModuleSpecifier.ts"
import {getToolchain} from "#~src/getToolchain.ts"
import {getInternalData} from "./getInternalData.ts"
import path from "node:path"

export async function getRequestedEmbedsFromProjectSourceFile(
	apiContext: APIContext,
	session: EnkoreSessionAPI,
	sourceFilePath: string
): Promise<RequestedEmbedsFromCodeResult> {
	const cache = getInternalData(session).requestedEmbedsFileCache

	if (cache.has(sourceFilePath)) {
		return cache.get(sourceFilePath)!
	}

	const objectFiles = session.enkore.getCreatedObjectFilesForRelativeSourcePath(
		sourceFilePath
	).filter(path => {
		return path.endsWith(".mjs") || path.endsWith(".js")
	})

	if (objectFiles.length > 1) {
		throw new Error(`found more than one object file for path '${sourceFilePath}'`)
	} else if (!objectFiles.length) {
		throw new Error(`unable to find object file for path '${sourceFilePath}'`)
	}

	const sourceCode = await readFileString(
		path.join(
			session.project.root, "objects", objectFiles[0]
		)
	)

	const result = await getToolchain(session).getRequestedEmbedsFromCode(
		[`${getBaseModuleSpecifier(apiContext.target)}/project`],
		[
			"getEmbedAsString",
			"getEmbedAsUint8Array",
			"getEmbedAsURL"
		],
		sourceCode
	)

	cache.set(sourceFilePath, result)

	return result
}
