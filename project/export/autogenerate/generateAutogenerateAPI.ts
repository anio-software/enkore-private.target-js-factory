import type {AutogenerateAPI} from "#~src/autogenerate/AutogenerateAPI.ts"
import type {AutogenerateAPIContext} from "#~src/autogenerate/AutogenerateAPIContext.ts"
import type {TargetJSIdentifier} from "#~src/TargetJSIdentifier.ts"

import {generateFactoryFileFactory} from "#~src/autogenerate/public/generateFactoryFileFactory.ts"
import {generateFactoryWithInstantiationFileFactory} from "#~src/autogenerate/public/generateFactoryWithInstantiationFileFactory.ts"

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
