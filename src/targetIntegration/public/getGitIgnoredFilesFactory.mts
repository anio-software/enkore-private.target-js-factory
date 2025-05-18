import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"

const impl: API["getGitIgnoredFiles"] = async function(
	this: APIContext
) {
	return [
		"/.npmrc"
	]
}

export function getGitIgnoredFilesFactory(context: APIContext) {
	return impl!.bind(context)
}
