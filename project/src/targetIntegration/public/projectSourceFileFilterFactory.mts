import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"

const impl: API["projectSourceFileFilter"] = async function(
	this: APIContext, _, file
) {
	const {fileName} = file

	if (fileName.endsWith(".d.ts")) {
		return false
	} else if (fileName.endsWith(".css")) {
		return true
	} else if (fileName.endsWith(".ts")) {
		return true
	} else if (fileName.endsWith(".tsx")) {
		return true
	}

	return false
}

export function projectSourceFileFilterFactory(context: APIContext) {
	return impl!.bind(context)
}
