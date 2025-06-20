import type {API} from "#~src/targetIntegration/API.ts"
import type {APIContext} from "#~src/targetIntegration/APIContext.ts"

const impl: API["getGitIgnoredFiles"] = async function(
	this: APIContext
) {
	return []
}

export function getGitIgnoredFilesFactory(context: APIContext) {
	return impl!.bind(context)
}
