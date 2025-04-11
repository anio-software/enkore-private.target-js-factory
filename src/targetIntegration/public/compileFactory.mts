import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import {getTargetDependency} from "#~src/targetIntegration/getTargetDependency.mts"
import path from "node:path"
import {getInternalData} from "#~src/targetIntegration/getInternalData.mts"
import {getTypeScriptDefinition} from "#~src/targetIntegration/getTypeScriptDefinition.mts"

const impl: API["compile"] = async function(
	this: APIContext, session, file, code
) {
	const sourceFilePath = file.relativePath
	const fileName = path.basename(sourceFilePath)
	const isTypeScriptFile = fileName.endsWith(".mts")

	session.enkore.emitMessage("info", "called compile " + sourceFilePath)

	const nodeMyTS = getTargetDependency(session, "@enkore/typescript")
	const myProgram = getInternalData(session).myTSProgram

	if (sourceFilePath.startsWith("assets/")) {
		const ret = [{
			contents: code,
			name: fileName + ".txt"
		}]

		// todo: handle/allow .mjs files?
		if (isTypeScriptFile) {
			const myTSModule = myProgram.getModule(`build/${sourceFilePath}`)

			ret.push({
				contents: nodeMyTS.stripTypes(myTSModule.source, true),
				name: fileName.slice(0, -4) + ".mjs.txt"
			})

			ret.push({
				contents: getTypeScriptDefinition(session, myTSModule),
				name: fileName.slice(0, -4) + ".d.mts.txt"
			})
		}

		return ret
	}

	if (file.wasFiltered) return "ignore"

	const myTSModule = myProgram.getModule(`build/${sourceFilePath}`)

	return [{
		contents: nodeMyTS.stripTypes(myTSModule.source, true),
		name: fileName.slice(0, -4) + ".mjs"
	}, {
		contents: getTypeScriptDefinition(session, myTSModule),
		name: fileName.slice(0, -4) + ".d.mts"
	}]
}

export function compileFactory(context: APIContext) {
	return impl!.bind(context)
}
