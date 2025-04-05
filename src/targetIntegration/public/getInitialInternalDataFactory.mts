import type {API} from "#~src/API.d.mts"
import type {APIContext} from "#~src/APIContext.d.mts"

const impl: API["getInitialInternalData"] = async function(
	this: APIContext
) {
	return {
		entryPointMap: new Map()
	}
}

export function getInitialInternalDataFactory(context: APIContext) {
	return impl!.bind(context)
}
