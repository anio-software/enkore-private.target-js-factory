import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
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

	const toolchain = session.target._getToolchain("@enkore/target-js-toolchain")
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

	const targetOptions = session.target.getOptions(this.target)
	const packageNames: string[] = (() => {
		if (!Array.isArray(targetOptions.publish?.withPackageNames)) {
			return []
		}

		return targetOptions.publish.withPackageNames
	})()
	const typePackageNames: string[] = (() => {
		if (!Array.isArray(targetOptions.publish?.typesPackage?.withPackageNames)) {
			return []
		}

		return targetOptions.publish.typesPackage.withPackageNames
	})()

	const products = []

	// todo could add md5 sum of package name to
	// ensure package name read back is the same as here

	if (!packageNames.length) {
		products.push({
			name: "npmPackage"
		})
	} else {
		for (const [index] of packageNames.entries()) {
			products.push({
				name: `npmPackage_${index}`
			})
		}
	}

	if (typePackageNames.length) {
		for (const [index] of typePackageNames.entries()) {
			products.push({
				name: `npmTypesPackage_${index}`
			})
		}
	}

	getInternalData(session).npmPackageNames = packageNames
	getInternalData(session).npmTypesPackageNames = typePackageNames

	return {
		products
	}
}

export function initializeFactory(context: APIContext) {
	return impl!.bind(context)
}
