import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"

const impl: API["projectSourceFileFilter"] = async function(
	this: APIContext, _, file
) {
	if (file.fileName.endsWith(".d.mts")) {
		return false
	}

	return file.fileName.endsWith(".mts")
}

export function projectSourceFileFilterFactory(context: APIContext) {
	return impl!.bind(context)
}
