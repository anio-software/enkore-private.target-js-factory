import type {EnkoreSessionAPI} from "@enkore/spec"
import type {InternalData} from "./InternalData.d.mts"

export function getInternalData(session: EnkoreSessionAPI) {
	return session.target.getInternalData() as InternalData
}
