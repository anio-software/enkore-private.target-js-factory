import {
	type EnkoreSessionAPI,
	type EnkoreJSRuntimeEmbeddedFile,
	isEntityOfKind,
	createEntity
} from "@enkore/spec"
import {getTargetDependency} from "./getTargetDependency.mts"
import {getInternalData} from "./getInternalData.mts"

export function mergeAndHoistGlobalRuntimeDataRecords(
	session: EnkoreSessionAPI,
	code: string
): string {
	const babel = getTargetDependency(session, "@enkore/babel")
	let newEmbeds: Record<string, EnkoreJSRuntimeEmbeddedFile> = {}

	const {
		code: newCode,
		globalDataRecords
	} = babel.removeEnkoreJSRuntimeArtifactsFromCode(
		code
	)

	for (const record of globalDataRecords) {
		if (!isEntityOfKind(record, "EnkoreJSRuntimeGlobalDataRecord")) {
			continue
		}

		// quick hack
		if (!record.immutable) continue

		for (const id in record.immutable.embeds) {
			newEmbeds[id] = record.immutable.embeds[id]
		}
	}

	const newRecord = createEntity("EnkoreJSRuntimeGlobalDataRecord", 0, 0, {
		immutable: {
			projectId: getInternalData(session).projectId,
			embeds: newEmbeds
		},
		// will be populated / used at runtime
		mutable: {
			embedResourceURLs: {}
		}
	})

	let ret = ``

	ret += babel.defineEnkoreJSRuntimeGlobalDataRecord(newRecord)

	ret += babel.defineEnkoreJSRuntimeGlobalInitFunction(`runtimeData`, `
		for (const embedId in runtimeData.immutable.embeds) {
			const embed = runtimeData.immutable.embeds[embedId]

			if (embed._createResourceAtRuntimeInit !== true) continue
			if (embedId in runtimeData.mutable.embedResourceURLs) {
				continue
			}

			runtimeData.mutable.embedResourceURLs[embedId] = "something"
		}
`)
	ret += babel.invokeEnkoreJSRuntimeGlobalInitFunction()
	ret += newCode

	return ret
}
