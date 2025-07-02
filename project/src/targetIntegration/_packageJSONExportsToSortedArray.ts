import type {NodePackageJSON} from "@anio-software/enkore-private.spec/primitives"

export type PackageJSONExport = {
	path: string
	spec: NonNullable<NodePackageJSON["exports"]>[string]
}

export function _packageJSONExportsToSortedArray(
	packageExports: NonNullable<NodePackageJSON["exports"]>
): PackageJSONExport[] {
	const packageExportsAsArray: PackageJSONExport[] = Object.keys(
		packageExports
	).map(key => {
		return {
			path: key,
			spec: packageExports[key]
		}
	})

	// NB: we do two sorts because we want them in alphabetical order
	// if two paths happen to have the same length

	// first sort alphabetically
	packageExportsAsArray.sort((a, b) => {
		return a.path.localeCompare(b.path, "en")
	})

	// then by length
	packageExportsAsArray.sort((a, b) => {
		return a.path.length - b.path.length
	})

	return packageExportsAsArray
}
