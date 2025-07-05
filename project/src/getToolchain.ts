import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {__ModuleExport} from "@anio-software/enkore-private.target-js-toolchain_types"

export function getToolchain(session: EnkoreSessionAPI) {
	// temporary backwards compat
	if ("_getToolchain" in session.target) {
		session.enkore.emitMessage("warning", `USING OLD _getToolchain() API`)

		return (session.target as any)._getToolchain("js") as __ModuleExport
	}

	return session.target.__getCurrentlyInstalledToolchain() as __ModuleExport
}
