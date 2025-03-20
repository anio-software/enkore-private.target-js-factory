import type {EnkoreSessionAPI} from "@enkore/spec"
import type {JsBundlerOptions} from "@enkore-types/realm-js-and-web-utils"

export function getOnRollupLogFunction(
	session: EnkoreSessionAPI
): JsBundlerOptions["onRollupLogFunction"] {
	return (level, message) => {
		
	}
}
