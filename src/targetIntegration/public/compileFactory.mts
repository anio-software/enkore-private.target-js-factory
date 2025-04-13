import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import {getTargetDependency} from "#~src/targetIntegration/getTargetDependency.mts"
import path from "node:path"
import {getInternalData} from "#~src/targetIntegration/getInternalData.mts"
import {getTypeScriptDefinition} from "#~src/targetIntegration/getTypeScriptDefinition.mts"
import {getModuleGuarded} from "#~src/targetIntegration/getModuleGuarded.mts"

type OnlyArray<T> = T extends object[] ? T : never
type ObjectFile = OnlyArray<Awaited<ReturnType<API["compile"]>>>[number]

const impl: API["compile"] = async function(
	this: APIContext, session, file, code
) {
	const ret: ObjectFile[] = []

	const sourceFilePath = file.relativePath
	const fileName = path.basename(sourceFilePath)

	session.enkore.emitMessage("info", "called compile " + sourceFilePath)

	// todo: i think this doesn't apply to assets/
	if (file.wasFiltered) return "unsupported"

	const nodeMyTS = getTargetDependency(session, "@enkore/typescript")
	const myProgram = getInternalData(session).myTSProgram

	if (fileName.endsWith(".mts")) {
		const myTSModule = getModuleGuarded(myProgram, `build/${sourceFilePath}`)

		ret.push({
			contents: nodeMyTS.stripTypes(myTSModule.source, true),
			name: fileName.slice(0, -4) + ".mjs"
		})

		ret.push({
			contents: getTypeScriptDefinition(session, myTSModule),
			name: fileName.slice(0, -4) + ".d.mts"
		})
	}

	if (sourceFilePath.startsWith("assets/")) {
		ret.push({
			contents: code,
			name: fileName + ".txt"
		})
	}

	return ret
}

export function compileFactory(context: APIContext) {
	return impl!.bind(context)
}
