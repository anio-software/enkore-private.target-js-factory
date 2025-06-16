import type {NodePackageJSON} from "@anio-software/enkore-private.spec/primitives"

export function _getPartialPackageJSONString(packageJSON: NodePackageJSON): string {
	const clonedPackageJSON = globalThis.structuredClone(packageJSON)

	delete clonedPackageJSON.exports

	let ret = JSON.stringify(clonedPackageJSON, null, 2)

	const c1 = ret.lastIndexOf("}")
	if (c1 === -1) throw new Error(`unable to find first curly bracket`)
	ret = ret.slice(0, c1)

	const c2 = ret.lastIndexOf("}")
	if (c2 === -1) throw new Error(`unable to find second curly bracket`)
	ret = ret.slice(0, c2)

	return ret
}
