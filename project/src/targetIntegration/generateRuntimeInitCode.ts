import type {APIContext} from "./APIContext.ts"
import {
	type EnkoreSessionAPI,
	type EnkoreJSRuntimeEmbeddedFile,
	type EnkoreJSRuntimeProjectAPIContext,
	createEntity,
	parseEmbedURL
} from "@anio-software/enkore-private.spec"
import type {EntryPoint} from "./InternalData.ts"
import {getToolchain} from "#~src/getToolchain.ts"
import {readFileString} from "@anio-software/pkg.node-fs"
import {getEmbedAsString} from "@anio-software/enkore.target-js-node/project"
import {globalStateSymbolForIdentifier} from "js-runtime-helpers/v0"
import {isSideEffectFreeImport} from "./isSideEffectFreeImport.ts"
import temporaryResourceFactory from "@anio-software/pkg.temporary-resource-factory/_source"

function defineEmbed(globalIdentifier: string, data: EnkoreJSRuntimeEmbeddedFile): string {
	let code = ``

	code += `if (!embedsMap.has("${globalIdentifier}")) {\n`
	code += `\tconst embed = ${JSON.stringify(data)};\n`
	code += `\tembedsMap.set("${globalIdentifier}", embed)\n`

	if (data.createResourceAtRuntimeInit) {
		code += `\tconst creationOptions = _getCreationOptionsForEmbed("${data.url}");\n`
		code += `\tconst {resourceURL} = createTemporaryResourceFromStringSync(embed.data, creationOptions);\n`
		code += `\tglobalState.mutable.embedResourceURLs.set(`
		code += `"${globalIdentifier}", resourceURL`
		code += `);\n`
	}

	code += `}\n`

	return code
}

async function bundle(
	session: EnkoreSessionAPI,
	code: string
) {
	const toolchain = getToolchain(session)

	return await toolchain.jsBundler(
		session.project.root, code, {
			outputFormat: "iife",
			treeshake: {
				moduleSideEffects(id) {
					return !isSideEffectFreeImport(id)
				}
			},
			additionalPlugins: [{
				when: "pre",
				plugin: {
					name: "resolver",
					resolveId(id) {
						if (id === "api/_getInitialGlobalState") {
							return `\x00enkore:_getInitialGlobalState`
						} else if (id === "api/temporaryResourceFactory") {
							return `\x00enkore:temporaryResourceFactory`
						} else if (id === "api/_getCreationOptionsForEmbed") {
							return `\x00enkore:_getCreationOptionsForEmbed`
						}

						return null
					},

					load(id) {
						if (id === `\x00enkore:_getInitialGlobalState`) {
							return getEmbedAsString("js-bundle://projectAPI/_getInitialGlobalState.ts")
						} else if (id === `\x00enkore:temporaryResourceFactory`) {
							return temporaryResourceFactory
						} else if (id === `\x00enkore:_getCreationOptionsForEmbed`) {
							return getEmbedAsString("js-bundle://projectAPI/_getCreationOptionsForEmbed.ts")
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
	projectAPIContext: EnkoreJSRuntimeProjectAPIContext,
	entryPoint: EntryPoint
): Promise<string> {
	if (session.target.getOptions(apiContext.target)._disableRuntimeCodeInjection === true) {
		return ""
	} else if (entryPoint.localEmbeds === "none" && !entryPoint.remoteEmbeds.size) {
		session.enkore.emitMessage("info", "skipping runtime js code, no embeds are used.")

		return ""
	}

	const {packageJSON} = session.project

	let code = ``

	code += `import {_getInitialGlobalState} from "api/_getInitialGlobalState"\n`
	code += `import {createTemporaryResourceFromStringSyncFactory} from "api/temporaryResourceFactory"\n`
	code += `import {_getCreationOptionsForEmbed} from "api/_getCreationOptionsForEmbed"\n`

	code += `const globalStateSymbol = Symbol.for("${globalStateSymbolForIdentifier}");\n`
	code += `const nodeRequireSymbol = Symbol.for("@anio-software/enkore/global/nodeRequire");\n`

	code += `const createTemporaryResourceFromStringSync = `
	code += `createTemporaryResourceFromStringSyncFactory(globalThis[nodeRequireSymbol]);\n`

	code += `if (!(globalStateSymbol in globalThis)) {\n`
	code += `\tglobalThis[globalStateSymbol] = _getInitialGlobalState();\n`
	code += `}\n`

	code += `const globalState = globalThis[globalStateSymbol];\n`
	code += `const embedsMap = globalState.immutable.embeds;\n`
	code += `\n/** local embeds **/\n`

	if (entryPoint.localEmbeds !== "none") {
		for (const [embedURL, {createResourceAtRuntimeInit}] of entryPoint.localEmbeds.entries()) {
			const embed = projectAPIContext._projectEmbedFileMapRemoveMeInBundle!.get(embedURL)!
			const {protocol, path: sourceFilePath} = parseEmbedURL(embedURL)
			const globalIdentifier = `${packageJSON.name}/v${packageJSON.version}/${protocol}/${sourceFilePath}`

			const data = createEntity("EnkoreJSRuntimeEmbeddedFile", 0, 0, {
				createResourceAtRuntimeInit,
				sourceFilePath,
				url: embedURL,
				data: embed.data
			})

			code += defineEmbed(globalIdentifier, data)
		}
	}

	code += `\n/** external embeds **/\n`

	for (const [globalIdentifier, embed] of entryPoint.remoteEmbeds.entries()) {
		const {
			createResourceAtRuntimeInit,
			sourceFilePath,
			url
		} = embed

		code += defineEmbed(globalIdentifier, createEntity("EnkoreJSRuntimeEmbeddedFile", 0, 0, {
			sourceFilePath,
			url,
			createResourceAtRuntimeInit,
			data: await readFileString(embed.absoluteSourceFilePath)
		}))
	}

	const nodeRequire = `
await (async function() {
	try {
		const nodeRequireSymbol = Symbol.for("@anio-software/enkore/global/nodeRequire");

		const {createRequire} = await import("node:module")

		globalThis[nodeRequireSymbol] = createRequire("/")
	} catch (error) {}
})();
`

	return nodeRequire + await bundle(session, code)
}
