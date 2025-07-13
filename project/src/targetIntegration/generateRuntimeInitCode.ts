import type {APIContext} from "./APIContext.ts"
import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {EntryPoint} from "./InternalData.ts"

export function generateRuntimeInitCode(
	apiContext: APIContext,
	session: EnkoreSessionAPI,
	entryPoint: EntryPoint
): string {
	return ""
}
