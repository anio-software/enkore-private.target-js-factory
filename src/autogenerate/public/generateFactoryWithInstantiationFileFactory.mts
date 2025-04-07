import type {AutogenerateAPI} from "#~src/autogenerate/AutogenerateAPI.mts"
import type {AutogenerateAPIContext} from "#~src/autogenerate/AutogenerateAPIContext.mts"
import type {Variant} from "#~src/autogenerate/generateFactoryInstantiationFile/Variant.mts"
import {isAsyncSyncExpandableFilePath,} from "@enkore/target-js-utils"
import {checkOptions} from "#~src/autogenerate/generateFactoryInstantiationFile/checkOptions.mts"
import {expand} from "#~src/autogenerate/generateFactoryInstantiationFile/expand.mts"
import {_generateFactoryFile} from "#~src/autogenerate/generateFactoryInstantiationFile/_generateFactoryFile.mts"
import {_generateInstantiationFile} from "#~src/autogenerate/generateFactoryInstantiationFile/_generateInstantiationFile.mts"

const impl: AutogenerateAPI["generateFactoryWithInstantiationFile"] = function(
	this: AutogenerateAPIContext,
	options,
	// this is to be able to tell if expand() was used
	// users should never set this value
	__internalIsAsyncSyncVariant?: Variant
) {
	checkOptions(options)

	if (isAsyncSyncExpandableFilePath(options.source)) {
		return expand(this, options, impl)
	}

	return [
		_generateFactoryFile(
			this,
			options,
			__internalIsAsyncSyncVariant ?? "noVariant"
		),
		_generateInstantiationFile(options)
	]
}

export function generateFactoryWithInstantiationFileFactory(context: AutogenerateAPIContext) {
	return impl!.bind(context)
}

