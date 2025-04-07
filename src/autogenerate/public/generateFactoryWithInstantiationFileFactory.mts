import type {AutogenerateAPI} from "#~src/autogenerate/AutogenerateAPI.mts"
import type {AutogenerateAPIContext} from "#~src/autogenerate/AutogenerateAPIContext.mts"

const impl: AutogenerateAPI["generateFactoryWithInstantiationFile"] = function(
	this: AutogenerateAPIContext, options
) {
	return []
}

export function generateFactoryWithInstantiationFileFactory(context: AutogenerateAPIContext) {
	return impl!.bind(context)
}

