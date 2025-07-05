import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {InternalData} from "./InternalData.ts"

export function getInternalData(session: EnkoreSessionAPI) {
	return session.target.__getInternalData() as InternalData
}
