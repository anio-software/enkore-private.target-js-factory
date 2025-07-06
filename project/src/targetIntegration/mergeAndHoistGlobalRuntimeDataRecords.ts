import {
	type EnkoreSessionAPI,
	type EnkoreJSRuntimeEmbeddedFile,
	isEntityOfKind,
	createEntity
} from "@anio-software/enkore-private.spec"
import {getInternalData} from "./getInternalData.ts"
import {log} from "@anio-software/enkore-private.debug"
import temporaryResourceFactory from "@anio-software/pkg.temporary-resource-factory/_source"
import {getToolchain} from "#~src/getToolchain.ts"

const embedProtocolTypeMap = {
	"text"     : {mimeType: "text/plain"     , fileExtension: ".txt"},
	"js-bundle": {mimeType: "text/javascript", fileExtension: ".mjs"},
	"js"       : {mimeType: "text/javascript", fileExtension: ".mjs"},
	"dts"      : {mimeType: "text/plain"     , fileExtension: ".d.mts"}
}

export async function mergeAndHoistGlobalRuntimeDataRecords(
	session: EnkoreSessionAPI,
	entryPointPath: string,
	code: string
): Promise<{
	runtimeInitCode: string
	codeWithArtifactsRemoved: string
}> {
	const toolchain = getToolchain(session)
	let newEmbeds: Record<string, EnkoreJSRuntimeEmbeddedFile> = {}

	const {
		code: codeWithArtifactsRemoved,
		globalDataRecords
	} = toolchain.removeEnkoreJSRuntimeArtifactsFromCode(
		code
	)

	for (const record of globalDataRecords) {
		if (!isEntityOfKind(record, "EnkoreJSRuntimeGlobalDataRecord")) {
			continue
		}

		// quick hack
		if (!record.immutable) continue

		log(
			`Merging global data record with id '${record.immutable.globalDataRecordId}'`
		)

		for (const id in record.immutable.embeds) {
			newEmbeds[id] = record.immutable.embeds[id]

			log(
				`Adding embed '${newEmbeds[id].originalEmbedPath}' from project '${newEmbeds[id]._projectIdentifier}'.`
			)
		}
	}

	const newRecord = createEntity("EnkoreJSRuntimeGlobalDataRecord", 0, 0, {
		immutable: {
			globalDataRecordId: `${getInternalData(session).projectId}/${entryPointPath}`,
			embeds: newEmbeds
		},
		// will be populated / used at runtime
		mutable: {
			embedResourceURLs: {}
		}
	})

	const runtimeInitCode = `
import {createTemporaryResourceFromStringSyncFactory} from "temporary-resource-factory"

function getCreationOptionsForEmbed(embedURL) {
	if (embedURL.startsWith("js-bundle://")) {
		return makeRetObject(${JSON.stringify(embedProtocolTypeMap["js-bundle"])})
	} else if (embedURL.startsWith("js://")) {
		return makeRetObject(${JSON.stringify(embedProtocolTypeMap["js"])})
	} else if (embedURL.startsWith("dts://")) {
		return makeRetObject(${JSON.stringify(embedProtocolTypeMap["dts"])})
	}

	return makeRetObject(${JSON.stringify(embedProtocolTypeMap["text"])})

	function makeRetObject({mimeType, fileExtension}) {
		return {
			web: {mimeType},
			node: {fileExtension},
			autoCleanup: true,
			createAsReadonly: true
		}
	}
}

const createTemporaryResourceFromStringSync = createTemporaryResourceFromStringSyncFactory(
	nodeRequire
)

for (const embedId in runtimeData.immutable.embeds) {
	const embed = runtimeData.immutable.embeds[embedId]

	if (embed._createResourceAtRuntimeInit !== true) continue
	if (embedId in runtimeData.mutable.embedResourceURLs) {
		continue
	}

	// from https://web.dev/articles/base64-encoding
	const binString = globalThis.atob(embed.data)
	const buffer = Uint8Array.from(binString, (m) => m.codePointAt(0))

	runtimeData.mutable.embedResourceURLs[embedId] = createTemporaryResourceFromStringSync(
		(new TextDecoder).decode(buffer), getCreationOptionsForEmbed(embed.originalEmbedPath)
	).resourceURL
}
`

	const bundledRuntimeInitCode = await toolchain.jsBundler(
		session.project.root, runtimeInitCode, {
			outputFormat: "iife",
			additionalPlugins: [{
				when: "pre",
				plugin: {
					name: "anio-software-temporary-resource-factory-resolver",
					resolveId(id) {
						if (id === `temporary-resource-factory`) {
							return `@anio-software/pkg.temporary-resource-factory`
						}

						return null
					},

					load(id) {
						if (id === `@anio-software/pkg.temporary-resource-factory`) {
							return temporaryResourceFactory
						}

						return null
					}
				}
			}]
		}
	)

	let ret = ``

	ret += toolchain.defineEnkoreJSRuntimeGlobalDataRecord(newRecord)

	ret += toolchain.defineEnkoreJSRuntimeGlobalInitFunction(
		[`runtimeData`, `nodeRequire`], bundledRuntimeInitCode
	)
	ret += toolchain.invokeEnkoreJSRuntimeGlobalInitFunction()

	return {
		runtimeInitCode: ret,
		codeWithArtifactsRemoved
	}
}
