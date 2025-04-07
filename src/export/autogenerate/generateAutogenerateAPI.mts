import type {AutogenerateAPI} from "#~src/autogenerate/AutogenerateAPI.mts"
import type {AutogenerateAPIContext} from "#~src/autogenerate/AutogenerateAPIContext.mts"
import type {TargetJSIdentifier} from "#~src/TargetJSIdentifier.d.mts"

import {generateFactoryFileFactory} from "#~src/autogenerate/public/generateFactoryFileFactory.mts"
import {generateFactoryWithInstantiationFileFactory} from "#~src/autogenerate/public/generateFactoryWithInstantiationFileFactory.mts"

export async function generateAutogenerateAPI(target: TargetJSIdentifier): Promise<AutogenerateAPI> {
	const context: AutogenerateAPIContext = {
		target
	}

	return {
		apiID: "EnkoreTargetJSAutogenerateAPI",
		apiMajorVersion: 0,
		apiRevision: 0,
		generateFactoryFile: generateFactoryFileFactory(context),
		generateFactoryWithInstantiationFile: generateFactoryWithInstantiationFileFactory(context)
	}
}
