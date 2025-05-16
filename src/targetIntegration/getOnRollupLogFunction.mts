import type {EnkoreSessionAPI} from "@asint/enkore__spec"
import type {JsBundlerOptions} from "@enkore-types/target-js-toolchain"

export function getOnRollupLogFunction(
	session: EnkoreSessionAPI
): JsBundlerOptions["onRollupLogFunction"] {
	return (level, message) => {
		
	}
}
