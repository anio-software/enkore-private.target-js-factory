import type {APIContext} from "./APIContext.ts"
import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {ProjectAPIContext} from "#~embeds/project/ProjectAPIContext.ts"
import type {EntryPoint} from "./InternalData.ts"
import {getToolchain} from "#~src/getToolchain.ts"
import {parseEmbedURL} from "@anio-software/enkore-private.spec/utils"
import {createEntity} from "@anio-software/enkore-private.spec"
import {getEmbedAsString} from "@anio-software/enkore.target-js-node/project"

async function bundle(
	session: EnkoreSessionAPI,
	code: string
) {
	const toolchain = getToolchain(session)

	return await toolchain.jsBundler(
		session.project.root, code, {
			outputFormat: "iife",

			additionalPlugins: [{
				when: "pre",
				plugin: {
					name: "resolver",
					resolveId(id) {
						if (id === "api/_getInitialGlobalState") {
							return `\x00enkore:_getInitialGlobalState`
						}

						return null
					},

					load(id) {
						if (id === `\x00enkore:_getInitialGlobalState`) {
							return getEmbedAsString("js-bundle://project/_getInitialGlobalState.ts")
						}

						return null
					}
				}
			}]
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

	code += `import {_getInitialGlobalState} from "api/_getInitialGlobalState"\n`

	code += `const embedsSymbol = Symbol.for("@anio-software/enkore/global/embeds");\n`
	code += `const globalStateSymbol = Symbol.for("@anio-software/enkore/global/embeds");\n`

	code += `if (!(globalStateSymbol in globalThis)) {\n`
	code += `\tglobalThis[globalStateSymbol] = _getInitialGlobalState();\n`
	code += `}\n`

	code += `if (!(embedSymbol in globalThis)) {\n`
	code += `\tglobalThis[embedSymbol] = new Map();\n`
	code += `}\n`

	code += `const embedsMap = globalThis[embedSymbol];\n`
	code += `const globalState = globalThis[globalStateSymbol];\n`

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
