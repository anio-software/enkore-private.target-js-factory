import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {__ModuleExport} from "@anio-software/enkore-private.target-js-toolchain_types"

export function getToolchain(session: EnkoreSessionAPI) {
	return session.target.__getCurrentlyInstalledToolchain() as __ModuleExport
}
