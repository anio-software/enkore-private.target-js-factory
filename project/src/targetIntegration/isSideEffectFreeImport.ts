export function isSideEffectFreeImport(id: string): boolean {
	if (id.startsWith("node:")) {
		return true
	} else if (id.startsWith(`@anio-software/enkore-private.js-runtime-helpers`)) {
		return true
	} else if (id.startsWith("@anio-software/enkore.js-runtime")) {
		return true
	}

	return false
}
