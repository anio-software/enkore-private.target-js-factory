import type {API} from "#~src/API.d.mts"
import type {APIContext} from "#~src/APIContext.d.mts"

const impl: API["getGitIgnoredFiles"] = async function(
	this: APIContext
) {
	return []
}

export const getGitIgnoredFiles = impl
