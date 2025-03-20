import type {EnkoreSessionAPI} from "@enkore/spec"
import type {NodePackageJSON} from "@enkore/spec/primitives"
import type {InternalData} from "./InternalData.d.mts"

type EntryPointMap = InternalData["entryPointMap"]

export function getProductPackageJSON(
	session: EnkoreSessionAPI,
	packageName: string,
	entryPointMap: EntryPointMap,
	typeOnly: boolean
): NodePackageJSON {
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
