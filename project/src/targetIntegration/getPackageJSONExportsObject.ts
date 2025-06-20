import type {InternalData} from "./InternalData.d.mts"
import type {NodePackageJSON} from "@anio-software/enkore-private.spec/primitives"

type PackageJSONExportsObject = NonNullable<NodePackageJSON["exports"]>

export function getPackageJSONExportsObject(
	entryPoints: InternalData["entryPoints"],
	typeOnly: boolean
): PackageJSONExportsObject {
	let ret: PackageJSONExportsObject = {}

	ret["./package.json"] = "./package.json"

	for (const [entryPointPath, entryPoint] of entryPoints.entries()) {
		const exportPath: string = (() => {
			if (entryPointPath === "default") {
				return ""
			}

			return `/${entryPointPath}`
		})()

		ret[`.${exportPath}`] = mjsFileExport(`./dist/${entryPointPath}/index.mjs`)

		if (!typeOnly) {
			ret[`./_source${exportPath}`] = mjsFileExport(`./_source/${entryPointPath}/index.mjs`)
		}

		if (entryPoint.hasCSSImports && !typeOnly) {
			ret[`.${exportPath}/style.css`] = `./dist/${entryPointPath}/style.css`
			ret[`./_source${exportPath}/style.css`] = mjsFileExport(`./_source/${entryPointPath}/style.css.mjs`)
		}
	}

	return ret

	function mjsFileExport(path: string) {
		if (typeOnly) {
			return {
				types: path.slice(0, -4) + ".d.mts"
			}
		}

		return {
			// ".mjs" is 4 letters long
			types: path.slice(0, -4) + ".d.mts",
			default: path
		}
	}
}
