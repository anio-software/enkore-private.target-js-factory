import type {EnkoreSessionAPI} from "@enkore/spec"
import type {JsBundlerOptions} from "@enkore-types/rollup"

export function getOnRollupLogFunction(
	session: EnkoreSessionAPI
): JsBundlerOptions["onRollupLogFunction"] {
	return (level, message) => {
		
	}
}
