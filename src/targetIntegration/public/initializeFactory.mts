import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import type {NPMPackage} from "../InternalData.d.mts"
import path from "node:path"
import {getInternalData} from "#~src/targetIntegration/getInternalData.mts"
import {buildEntryPointMap} from "#~src/targetIntegration/buildEntryPointMap.mts"
import {_getRegistryMap} from "../_getRegistryMap.mts"
import {_getCurrentGitCommitHash} from "../_getCurrentGitCommitHash.mts"
import {collectCSSFiles} from "../collectCSSFiles.mts"

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
	}).filter(file => {
		return !file.endsWith(".css")
	})

	const toolchain = session.target._getToolchain("js")
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
	getInternalData(session).cssFiles = collectCSSFiles(session)
	getInternalData(session).requestedEmbedsFileCache = new Map()

	if (session.enkore.getOptions()._partialBuild === true) {
		return {
			products: []
		}
	}

	const targetOptions = session.target.getOptions("js")
	const substitutes = getPackageNameSubstitutes(session.project.packageJSON.name)

	const npmPackages: NPMPackage[] = []

	if (targetOptions.publish) {
		const publishConfig = Array.isArray(
			targetOptions.publish
		) ? targetOptions.publish : [targetOptions.publish]

		const projectCommitHash = _getCurrentGitCommitHash(session.project.root)

		if (!projectCommitHash) {
			const isCIEnvironment = session.enkore.getOptions().isCIEnvironment !== false

			if (isCIEnvironment) {
				session.enkore.emitMessage(
					"error", `git commit hash cannot be retrieved. This is an error in CI environments.`
				)

				return {products: []}
			} else {
				session.enkore.emitMessage(
					"warning", `git commit hash cannot be retrieved.`
				)
			}
		}

		for (const config of publishConfig) {
			let packageVersion = session.project.packageJSON.version

			if (projectCommitHash && config.verbatimVersion !== true) {
				const shortCommitHash = projectCommitHash.slice(0, 8) + "-" + projectCommitHash.slice(-8)

				if (config.tag === "experimental") {
					packageVersion = `0.0.0-experimental-${shortCommitHash}`
				} else if (config.tag === "canary") {
					packageVersion += `-canary-${shortCommitHash}`
				}
			}

			npmPackages.push({
				name: searchAndReplace(
					// a bit unclean since we don't want to substitute what's
					// inside package.json, but the substitutes aren't valid
					// in a package name anyway so...
					config.packageName ?? session.project.packageJSON.name,
					substitutes
				),
				version: packageVersion,
				packageContents: config.packageContents ?? "project",
				publishConfig: {
					publishWithProvenance: config.publishWithProvenance ?? false,
					registry: config.registry ?? "default",
					tag: config.tag ?? "latest",
					skip: config.skip === true,
					verbatimVersion: config.verbatimVersion === true
				}
			})
		}
	}

	const products = [{
		name: "project"
	}, {
		name: "projectTypes"
	}]

	if (npmPackages.length) {
		for (const [index] of npmPackages.entries()) {
			products.push({
				name: `npmPackage_${index}`
			})
		}
	}

	getInternalData(session).npmPackages = npmPackages
	getInternalData(session).registryMap = _getRegistryMap(targetOptions)

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
