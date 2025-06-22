import type {APIContext} from "#~src/targetIntegration/APIContext.ts"
import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {NodePackageJSON} from "@anio-software/enkore-private.spec/primitives"
import type {InternalData} from "./InternalData.ts"
import {getPackageJSONExportsObject} from "./getPackageJSONExportsObject.ts"
import {isNodeTarget} from "@enkore/target-js-utils"
import {isObject} from "@anio-software/pkg.is"
import {
	getRequiredPeerDependencyPackages
} from "#~export/getRequiredPeerDependencyPackages.ts"
import type {PeerDependency} from "#~export/PeerDependency.ts"

type EntryPoints = InternalData["entryPoints"]

function peerDependenciesMapToObject(
	map: Map<string, PeerDependency>
): Record<string, string> {
	let ret: Record<any, any> = Object.create(null)

	for (const [key, value] of map.entries()) {
		if (value.forDevelopmentOnly) continue

		ret[key] = value.packageVersionRange
	}

	return ret
}

function exactDependencies(
	dependencies: Record<string, string>|undefined
): Record<string, string> {
	if (!dependencies) return {}

	const exactDependencies: Record<string, string> = {}

	for (const dependencyName in dependencies) {
		const dependencyVersion = dependencies[dependencyName]

		exactDependencies[dependencyName] = (() => {
			if (dependencyVersion.startsWith("~") ||
			    dependencyVersion.startsWith("^")) {
				return `=${dependencyVersion.slice(1)}`
			}

			return dependencyVersion
		})()
	}

	return exactDependencies
}

function removeNonTypeDependencies(
	peerDependencies: Record<string, string>|undefined
): Record<string, string> {
	if (!peerDependencies) return {}

	const typeOnlyPeerDependencies: Record<string, string> = {}

	for (const dependencyName in peerDependencies) {
		if (!dependencyName.startsWith("@types/")) {
			continue
		}

		typeOnlyPeerDependencies[dependencyName] = peerDependencies[dependencyName]
	}

	return typeOnlyPeerDependencies
}

type Options = {
	packageName: string
	gitRepositoryDirectory: string
	typeOnly: boolean
}

export function getProductPackageJSON(
	apiContext: APIContext,
	session: EnkoreSessionAPI,
	entryPoints: EntryPoints,
	options: Options
): NodePackageJSON {
	const targetOptions = session.target.getOptions(apiContext.target)

	let newPackageJSON: NodePackageJSON = {
		name: options.packageName,
		type: "module",
		version: session.project.packageJSON.version,
		author: session.project.packageJSON.author,
		license: session.project.packageJSON.license,
		description: session.project.packageJSON.description,
		peerDependencies: session.project.packageJSON.peerDependencies,
		dependencies: session.project.packageJSON.dependencies,

		files: ["./dist", "./_source"]
	}

	if (isNodeTarget(apiContext.target)) {
		newPackageJSON["engines"] = {
			"node": ">=23.6.x"
		}
	}

	const requiredPeerDependencies = peerDependenciesMapToObject(
		getRequiredPeerDependencyPackages(apiContext.target)
	)

	if (!isObject(newPackageJSON.peerDependencies)) {
		newPackageJSON.peerDependencies = requiredPeerDependencies
	} else {
		newPackageJSON.peerDependencies = {
			...requiredPeerDependencies,
			...newPackageJSON.peerDependencies
		}
	}

	// todo: check dependencies of type only package
	// by calling session.target._getToolchain("js").getModuleImportAndExportSpecifiers()
	// allow @types/ peerDependencies
	if (options.typeOnly) {
		newPackageJSON.dependencies = {}
		newPackageJSON.peerDependencies = removeNonTypeDependencies(
			newPackageJSON.peerDependencies
		)
	}

	if (targetOptions.publishWithExactDependencyVersions === true) {
		newPackageJSON.dependencies = exactDependencies(
			newPackageJSON.dependencies
		)
	}

	const {repository} = session.project.packageJSON

	if (repository) {
		newPackageJSON.repository = {
			type: repository.type,
			url: repository.url,
			directory: options.gitRepositoryDirectory
		}
	}

	newPackageJSON.exports = getPackageJSONExportsObject(entryPoints, options.typeOnly)

	return newPackageJSON
}
