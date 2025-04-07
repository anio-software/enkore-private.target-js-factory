import type {AutogenerateAPI} from "#~src/autogenerate/AutogenerateAPI.mts"
import type {AutogenerateAPIContext} from "#~src/autogenerate/AutogenerateAPIContext.mts"
import type {Variant} from "#~src/autogenerate/generateFactoryInstantiationFile/Variant.mts"
import {isAsyncSyncExpandableFilePath,} from "@enkore/target-js-utils"
import {checkOptions} from "#~src/autogenerate/generateFactoryInstantiationFile/checkOptions.mts"
import {expand} from "#~src/autogenerate/generateFactoryInstantiationFile/expand.mts"
import {_generateFactoryFile} from "#~src/autogenerate/generateFactoryInstantiationFile/_generateFactoryFile.mts"

const impl: AutogenerateAPI["generateFactoryFile"] = function(
	this: AutogenerateAPIContext,
	options,
	// this is to be able to tell if expand() was used
	// users should never set this value
	__internalIsAsyncSyncVariant?: Variant
) {
	checkOptions(options)

	if (isAsyncSyncExpandableFilePath(options.source)) {
		return expand(options, impl)
	}

	return [
		_generateFactoryFile(
			options,
			__internalIsAsyncSyncVariant ?? "noVariant"
		)
	]
}

export function generateFactoryFileFactory(context: AutogenerateAPIContext) {
	return impl!.bind(context)
}
