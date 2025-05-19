import type {EnkoreSessionAPI} from "@anio-software/enkore.spec"
import type {JsBundlerOptions} from "@anio-software/enkore-types.target-js-toolchain"

export function getOnRollupLogFunction(
	session: EnkoreSessionAPI
): JsBundlerOptions["onRollupLogFunction"] {
	return (level, message) => {
		
	}
}
