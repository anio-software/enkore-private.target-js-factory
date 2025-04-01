import type {API} from "#~src/API.d.mts"

const impl: API["getGitIgnoredFiles"] = async function() {
	return []
}

export const getGitIgnoredFiles = impl
