import type {API} from "#~src/targetIntegration/API.ts"
import type {APIContext} from "#~src/targetIntegration/APIContext.ts"

const impl: API["projectSourceFileFilter"] = async function(
	this: APIContext, _, file
) {
	const {fileName} = file

	//
	// this prevents the inclusion of files that are inside project/bin
	// project/bin files are copied as is (with their types removed)
	//
	if (!file.relativePath.startsWith("src/") &&
	    !file.relativePath.startsWith("export/")) {
		return false
	}

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
