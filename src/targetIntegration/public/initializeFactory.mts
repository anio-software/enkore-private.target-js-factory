import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import {getTargetDependency} from "#~src/targetIntegration/getTargetDependency.mts"
import path from "node:path"
import {getInternalData} from "#~src/targetIntegration/getInternalData.mts"
import {buildEntryPointMap} from "#~src/targetIntegration/buildEntryPointMap.mts"
import crypto from "node:crypto"

function sha256Sync(str: string): string {
	const hash = crypto.createHash("sha256")

	return hash.update(str).digest("hex").toLowerCase()
}

const impl: API["initialize"] = async function(
	this: APIContext,
	session
) {
	session.enkore.emitMessage("debug", "initialize target")

	const typeScriptFiles = session.enkore.getProjectFiles(
		session.enkore.getOptions()._partialBuild === true ? "embeds" : undefined
	).map(file => {
		return path.join("build", file.relativePath)
	})

	const toolchain = getTargetDependency(session, "@enkore/target-js-toolchain")
	const {compilerOptions} = toolchain.tsReadTSConfigFile(
		session.project.root, "tsconfig/base.json"
	)

	const {
		program,
		diagnosticMessages
	} = toolchain.tsCreateProgram(
		session.project.root, typeScriptFiles, compilerOptions
	)

	for (const msg of diagnosticMessages) {
		session.enkore.emitMessage(
			"error", msg.message
		)
	}

	getInternalData(session).myTSProgram = program
	getInternalData(session).entryPointMap = buildEntryPointMap(session)
	getInternalData(session).requestedEmbedsFileCache = new Map()
	getInternalData(session).projectId = sha256Sync(
		`${session.project.packageJSON.name}@${session.project.packageJSON.version}`
	)

	if (session.enkore.getOptions()._partialBuild === true) {
		return {
			products: []
		}
	}

	const products = [{
		name: "npmPackage"
	}]

	const targetOptions = session.target.getOptions(this.target)
	const createTypesPackage = targetOptions.createTypesPackage !== undefined
	const packageNames: string[] = (() => {
		if (!Array.isArray(targetOptions.publish?.withPackageNames)) {
			return []
		}

		return targetOptions.publish.withPackageNames
	})()

	if (createTypesPackage) {
		products.push({
			name: "npmTypesPackage"
		})
	}

	return {
		products
	}
}

export function initializeFactory(context: APIContext) {
	return impl!.bind(context)
}
