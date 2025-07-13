import type {APIContext} from "./APIContext.ts"
import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {ProjectAPIContext} from "#~embeds/project/ProjectAPIContext.ts"
import type {EntryPoint} from "./InternalData.ts"
import {getToolchain} from "#~src/getToolchain.ts"

async function bundle(
	session: EnkoreSessionAPI,
	code: string
) {
	const toolchain = getToolchain(session)

	return await toolchain.jsBundler(
		session.project.root, code, {
			outputFormat: "iife"
		}
	)
}

export async function generateRuntimeInitCode(
	apiContext: APIContext,
	session: EnkoreSessionAPI,
	projectContext: ProjectAPIContext,
	entryPoint: EntryPoint
): Promise<string> {
	if (session.target.getOptions(apiContext.target)._disableRuntimeCodeInjection === true) {
		return ""
	} else if (entryPoint.embeds === "none") {
		return ""
	}

	let code = ``

	return await bundle(session, code)
}
