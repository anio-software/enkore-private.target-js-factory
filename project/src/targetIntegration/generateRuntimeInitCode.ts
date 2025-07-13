import type {APIContext} from "./APIContext.ts"
import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {ProjectAPIContext} from "#~embeds/project/ProjectAPIContext.ts"
import type {EntryPoint} from "./InternalData.ts"
import {getToolchain} from "#~src/getToolchain.ts"
import {parseEmbedURL} from "@anio-software/enkore-private.spec/utils"
import {createEntity} from "@anio-software/enkore-private.spec"

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

	const {packageJSON} = session.project

	let code = ``

	code += `const embedsSymbol = Symbol.for("@anio-software/enkore/global/embeds");\n`

	code += `if (!(embedSymbol in globalThis)) {\n`
	code += `\tglobalThis[embedSymbol] = new Map();\n`
	code += `}\n`

	code += `const embedsMap = globalThis[embedSymbol];\n`

	for (const [embedURL, {createResourceAtRuntime}] of entryPoint.embeds.entries()) {
		const embed = projectContext._projectEmbedFileMapRemoveMeInBundle!.get(embedURL)!
		const {protocol, path: sourceFilePath} = parseEmbedURL(embedURL)
		const globalIdentifier = `${packageJSON.name}/v${packageJSON.version}/${protocol}/${sourceFilePath}`

		const data = createEntity("EnkoreJSRuntimeEmbeddedFile", 0, 0, {
			createResourceAtRuntimeInit: createResourceAtRuntime,
			sourceFilePath,
			url: embedURL,
			data: embed.data
		})

		code += `if (!embedsMap.has("${globalIdentifier}")) {\n`
		code += `\tembedsMap.set("${globalIdentifier}", ${JSON.stringify(data)})\n`
		code += `}\n`
	}

	return await bundle(session, code)
}
