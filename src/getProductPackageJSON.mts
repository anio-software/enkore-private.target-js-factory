import type {EnkoreSessionAPI} from "@enkore/spec"
import type {NodePackageJSON} from "@enkore/spec/primitives"
import type {InternalData} from "./InternalData.d.mts"

type EntryPointMap = InternalData["entryPointMap"]

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

export function getProductPackageJSON(
	session: EnkoreSessionAPI,
	packageName: string,
	entryPointMap: EntryPointMap,
	typeOnly: boolean
): NodePackageJSON {
	const realmOptions = session.realm.getConfig("js")

	let newPackageJSON: NodePackageJSON = {
		name: packageName,
		type: "module",
		version: session.project.packageJSON.version,
		author: session.project.packageJSON.author,
		license: session.project.packageJSON.license,
		description: session.project.packageJSON.description,
		peerDependencies: session.project.packageJSON.peerDependencies,
		dependencies: session.project.packageJSON.dependencies,

		files: ["./dist"]
	}

	// todo: check dependencies of type only package
	// by calling getRealmDependency(session, "@aniojs/node-my-ts").getModuleImportAndExportSpecifiers()
	// allow @types/ peerDependencies
	if (typeOnly) {
		newPackageJSON.dependencies = {}
		newPackageJSON.peerDependencies = {}
	}

	const {publishWithExactDependencyVersions} = realmOptions

	if (publishWithExactDependencyVersions === true) {
		newPackageJSON.dependencies = exactDependencies(
			newPackageJSON.dependencies
		)
	}

	const {repository} = session.project.packageJSON

	if (repository) {
		const productName = typeOnly ? "npmTypesPackage" : "npmPackage"

		newPackageJSON.repository = {
			type: repository.type,
			url: repository.url,
			directory: `products/${productName}`
		}
	}

	newPackageJSON.exports = (() => {
		const ret: Record<string, any> = {
			"./package.json": {
				"default": "./package.json"
			}
			//"./__enkoreBuildInfo": {
			//	"types": "./__enkoreBuildInfo/index.d.mts",
			//	"default": "./__enkoreBuildInfo/index.mjs"
			//}
		}

		for (const [entryPointPath] of entryPointMap.entries()) {
			const exp: Record<string, string> = {
				"types": `./dist/${entryPointPath}/index.d.mts`
			}

			if (!typeOnly) {
				exp["default"] = `./dist/${entryPointPath}/index.mjs`
			}

			if (entryPointPath === "default") {
				ret["."] = exp
			} else {
				ret[`./${entryPointPath}`] = exp
			}
		}

		return ret
	})()

	return newPackageJSON
}
