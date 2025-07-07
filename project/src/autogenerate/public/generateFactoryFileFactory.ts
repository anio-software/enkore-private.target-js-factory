import type {AutogenerateAPI} from "#~src/autogenerate/AutogenerateAPI.ts"
import type {AutogenerateAPIContext} from "#~src/autogenerate/AutogenerateAPIContext.ts"
import type {Variant} from "#~src/autogenerate/generateFactoryInstantiationFile/Variant.ts"
import {isAsyncSyncExpandableFilePath} from "@anio-software/enkore-private.target-js-utils"
import {checkOptions} from "#~src/autogenerate/generateFactoryInstantiationFile/checkOptions.ts"
import {expand} from "#~src/autogenerate/generateFactoryInstantiationFile/expand.ts"
import {_generateFactoryFile} from "#~src/autogenerate/generateFactoryInstantiationFile/_generateFactoryFile.ts"

const impl: AutogenerateAPI["generateFactoryFile"] = function(
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
		)
	]
}

export function generateFactoryFileFactory(context: AutogenerateAPIContext) {
	return impl!.bind(context)
}
