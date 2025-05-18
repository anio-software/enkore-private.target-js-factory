import type {EnkoreSessionAPI} from "@anio-software/enkore.spec"
import type {JsBundlerOptions} from "@enkore-types/target-js-toolchain"

export function getOnRollupLogFunction(
	session: EnkoreSessionAPI
): JsBundlerOptions["onRollupLogFunction"] {
	return (level, message) => {
		
	}
}
