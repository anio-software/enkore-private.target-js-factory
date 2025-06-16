import type {NodePackageJSON} from "@anio-software/enkore-private.spec/primitives"

export function _prettyPrintPackageJSONExports(
	packageJSON: NodePackageJSON
): string {
	return JSON.stringify(packageJSON, null, 4)
}
