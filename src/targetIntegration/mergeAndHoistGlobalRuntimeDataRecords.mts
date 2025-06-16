import {
	type EnkoreSessionAPI,
	type EnkoreJSRuntimeEmbeddedFile,
	isEntityOfKind,
	createEntity
} from "@anio-software/enkore-private.spec"
import {getInternalData} from "./getInternalData.mts"
import {log} from "@enkore/debug"

export function mergeAndHoistGlobalRuntimeDataRecords(
	session: EnkoreSessionAPI,
	entryPointPath: string,
	code: string
): string {
	const toolchain = session.target._getToolchain("js")
	let newEmbeds: Record<string, EnkoreJSRuntimeEmbeddedFile> = {}

	const {
		code: newCode,
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

	let ret = ``

	ret += toolchain.defineEnkoreJSRuntimeGlobalDataRecord(newRecord)

	ret += toolchain.defineEnkoreJSRuntimeGlobalInitFunction(`runtimeData`, `nodeRequire`, `
		for (const embedId in runtimeData.immutable.embeds) {
			const embed = runtimeData.immutable.embeds[embedId]

			if (embed._createResourceAtRuntimeInit !== true) continue
			if (embedId in runtimeData.mutable.embedResourceURLs) {
				continue
			}

			runtimeData.mutable.embedResourceURLs[embedId] = "something"
		}
`)
	ret += toolchain.invokeEnkoreJSRuntimeGlobalInitFunction()
	ret += newCode

	return ret
}
