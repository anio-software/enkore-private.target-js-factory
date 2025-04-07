import type {AutogenerateAPI} from "#~src/autogenerate/AutogenerateAPI.mts"
import type {AutogenerateAPIContext} from "#~src/autogenerate/AutogenerateAPIContext.mts"

const impl: AutogenerateAPI["generateFactoryFile"] = function(
	this: AutogenerateAPIContext, options
) {
	return []
}

export function generateFactoryFileFactory(context: AutogenerateAPIContext) {
	return impl!.bind(context)
}
