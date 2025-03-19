import type {API} from "#~src/API.d.mts"
import {getRealmDependency} from "#~src/getRealmDependency.mts"
import path from "node:path"
import {getInternalData} from "#~src/getInternalData.mts"
import {buildEntryPointMap} from "#~src/buildEntryPointMap.mts"

const impl: API["initialize"] = async function(session) {
	session.enkore.emitMessage("debug", "initialize realm")

	const typeScriptFiles = session.enkore.getProjectFiles(
		session.enkore.getOptions()._partialBuild === true ? "assets" : undefined
	).map(file => {
		return path.join("build", file.relativePath)
	})

	const nodeMyTS = getRealmDependency(session, "@aniojs/node-my-ts")
	const {compilerOptions} = nodeMyTS.readTSConfigFile(
		session.project.root, "tsconfig/base.json"
	)

	const {
		program,
		diagnosticMessages
	} = nodeMyTS.createProgram(
		session.project.root, typeScriptFiles, compilerOptions
	)

	for (const msg of diagnosticMessages) {
		session.enkore.emitMessage(
			"error", msg.message
		)
	}

	getInternalData(session).myTSProgram = program
	getInternalData(session).entryPointMap = buildEntryPointMap(session)

	if (session.enkore.getOptions()._partialBuild === true) {
		return {
			products: []
		}
	}

	const products = [{
		name: "package"
	}]

	const {createTypesPackage} = session.realm.getConfig("js")

	if (typeof createTypesPackage !== "undefined") {
		products.push({
			name: "typesPackage"
		})
	}

	return {
		products
	}
}

export const initialize = impl
