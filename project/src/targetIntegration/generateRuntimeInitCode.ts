import type {APIContext} from "./APIContext.ts"
import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {ProjectAPIContext} from "#~embeds/project/ProjectAPIContext.ts"
import type {EntryPoint} from "./InternalData.ts"

function iife(code: string) {
	return `
;(function() {
	${code}
})();
`
}

export function generateRuntimeInitCode(
	apiContext: APIContext,
	session: EnkoreSessionAPI,
	projectContext: ProjectAPIContext,
	entryPoint: EntryPoint
): string {
	if (session.target.getOptions(apiContext.target)._disableRuntimeCodeInjection === true) {
		return ""
	} else if (entryPoint.embeds === "none") {
		return ""
	}

	let code = ``

	return iife(code)
}
