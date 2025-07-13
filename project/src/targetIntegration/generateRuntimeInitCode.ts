import type {APIContext} from "./APIContext.ts"
import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {EntryPoint} from "./InternalData.ts"

export function generateRuntimeInitCode(
	apiContext: APIContext,
	session: EnkoreSessionAPI,
	entryPoint: EntryPoint
): string {
	if (session.target.getOptions(apiContext.target)._disableRuntimeCodeInjection === true) {
		return ""
	} else if (entryPoint.embeds === "none") {
		return ""
	}

	return ""
}
