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
import {getEmbedAsString} from "@anio-software/enkore.target-js-node/project"
import {_parseEnkoreEmbedProjectIdentifier} from "#~src/_parseEnkoreEmbedProjectIdentifier.ts"
import {_parseEmbedURL} from "#~embeds/project/_parseEmbedURL.ts"

type ExtractedLegacyEmbeds = Set<{
	createResource: boolean
	embedIdentifier: string
	data: string
}>

export async function mergeAndHoistGlobalRuntimeDataRecords(
	session: EnkoreSessionAPI,
	entryPointPath: string,
	code: string
): Promise<{
	runtimeInitCode: string
	codeWithArtifactsRemoved: string
	extractedLegacyEmbeds: ExtractedLegacyEmbeds
}> {
	const extractedLegacyEmbeds: ExtractedLegacyEmbeds = new Set()

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
			const embed = record.immutable.embeds[id]

			newEmbeds[id] = embed

			log(
				`Adding embed '${newEmbeds[id].originalEmbedPath}' from project '${newEmbeds[id]._projectIdentifier}'.`
			)

			const parsedProjectIdentifier = _parseEnkoreEmbedProjectIdentifier(
				embed._projectIdentifier
			)

			const parsedEmbedURL = _parseEmbedURL(embed.originalEmbedPath)

			const newEmbedURL: string = (() => {
				const {protocol, relativePath} = parsedEmbedURL
				const {scope, packageName, packageVersion} = parsedProjectIdentifier

				if (scope !== undefined) {
					return `${scope}/${packageName}/v${packageVersion}/${protocol}/${relativePath}`
				}

				return `${packageName}/v${packageVersion}/${protocol}/${relativePath}`
			})()

			extractedLegacyEmbeds.add({
				createResource: embed._createResourceAtRuntimeInit,
				embedIdentifier: newEmbedURL,
				data: (new TextDecoder).decode(
					Buffer.from(embed.data, "base64")
				)
			})
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
import {_getCreationOptionsForEmbed} from "enkore-internal-api"

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
		(new TextDecoder).decode(buffer), _getCreationOptionsForEmbed(embed.originalEmbedPath)
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
						} else if (id === `enkore-internal-api`) {
							return `enkore-internal-api`
						}

						return null
					},

					load(id) {
						if (id === `@anio-software/pkg.temporary-resource-factory`) {
							return temporaryResourceFactory
						} else if (id === "enkore-internal-api") {
							return getEmbedAsString("js-bundle://project/_getCreationOptionsForEmbed.ts")
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
		codeWithArtifactsRemoved,
		extractedLegacyEmbeds
	}
}
