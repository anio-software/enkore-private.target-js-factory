import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {JsBundlerOptions} from "@anio-software/enkore-private.target-js-toolchain_types"

export function getOnRollupLogFunction(
	session: EnkoreSessionAPI
): JsBundlerOptions["onRollupLogFunction"] {
	return (level, message) => {
		
	}
}
