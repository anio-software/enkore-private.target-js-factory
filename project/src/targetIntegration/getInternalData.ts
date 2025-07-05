import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {InternalData} from "./InternalData.ts"

export function getInternalData(session: EnkoreSessionAPI) {
	// temporary backwards compat
	if ("getInternalData" in session.target) {
		session.enkore.emitMessage("warning", `USING OLD getInternalData() API`)

		return (session.target as any).getInternalData() as InternalData
	}

	return session.target.__getInternalData() as InternalData
}
