import type {AutogenerateAPI} from "#~src/autogenerate/AutogenerateAPI.mts"
import type {AutogenerateAPIContext} from "#~src/autogenerate/AutogenerateAPIContext.mts"

import {generateFactoryFileFactory} from "#~src/autogenerate/public/generateFactoryFileFactory.mts"
import {generateFactoryWithInstantiationFileFactory} from "#~src/autogenerate/public/generateFactoryWithInstantiationFileFactory.mts"

export async function generateAutogenerateAPI(): Promise<AutogenerateAPI> {
	const context: AutogenerateAPIContext = {}

	return {
		apiID: "EnkoreTargetJSAutogenerateAPI",
		apiMajorVersion: 0,
		apiRevision: 0,
		generateFactoryFile: generateFactoryFileFactory(context),
		generateFactoryWithInstantiationFile: generateFactoryWithInstantiationFileFactory(context)
	}
}
