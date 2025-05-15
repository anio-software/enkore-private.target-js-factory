import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import type {NPMPackage} from "../InternalData.d.mts"
import path from "node:path"
import {getInternalData} from "#~src/targetIntegration/getInternalData.mts"
import {buildEntryPointMap} from "#~src/targetIntegration/buildEntryPointMap.mts"
import crypto from "node:crypto"

function sha256Sync(str: string): string {
	const hash = crypto.createHash("sha256")

	return hash.update(str).digest("hex").toLowerCase()
}

function getPackageNameSubstitutes(projectPackageName: string) {
	const tmp = projectPackageName.split("/")

	if (tmp.length === 1) {
		return {
			"<FQPN>": projectPackageName,
			"<FQPN_FLAT>": projectPackageName,
			"<PN>": projectPackageName,
			"<ORG>": ""
		}
	}

	const flatProjectPackageName = `${tmp[0].slice(1)}__${tmp[1]}`

	return {
		"<FQPN>": projectPackageName,
		"<FQPN_FLAT>": flatProjectPackageName,
		"<PN>": tmp[1],
		"<ORG>": tmp[0].slice(1)
	}
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
	const substitutes = getPackageNameSubstitutes(session.project.packageJSON.name)
	const mapper: (entry: any) => NPMPackage = (entry) => {
		if ("name" in entry) {
			return {
				name: searchAndReplace(entry.name, substitutes),
				publishWithProvenance: !!entry.publishWithProvenance
			}
		}

		return {
			name: searchAndReplace(entry, substitutes),
			publishWithProvenance: false
		}
	}

	const npmPackages: NPMPackage[] = (() => {
		if (!Array.isArray(targetOptions.publish?.withPackageNames)) {
			return [{
				name: session.project.packageJSON.name,
				publishWithProvenance: false
			}]
		}

		const {withPackageNames} = targetOptions.publish

		return withPackageNames.map(mapper).filter(x => x.name.length)
	})()
	const npmTypesPackages: NPMPackage[] = (() => {
		if (!Array.isArray(targetOptions.publish?.typesPackage?.withPackageNames)) {
			return []
		}

		const {withPackageNames} = targetOptions.publish.typesPackage

		return withPackageNames.map(mapper).filter(x => x.name.length)
	})()

	const products = []

	// todo could add md5 sum of package name to
	// ensure package name read back is the same as here

	if (npmPackages.length) {
		for (const [index] of npmPackages.entries()) {
			products.push({
				name: `npmPackage_${index}`
			})
		}
	}

	if (npmTypesPackages.length) {
		for (const [index] of npmTypesPackages.entries()) {
			products.push({
				name: `npmTypesPackage_${index}`
			})
		}
	}

	getInternalData(session).npmPackages = npmPackages
	getInternalData(session).npmTypesPackages = npmTypesPackages

	return {
		products
	}

	function searchAndReplace(str: string, map: Record<string, string>) {
		let newStr = str

		for (const key in map) {
			const replaceWith = map[key]

			newStr = newStr.split(key).join(replaceWith)
		}

		return newStr
	}
}

export function initializeFactory(context: APIContext) {
	return impl!.bind(context)
}
