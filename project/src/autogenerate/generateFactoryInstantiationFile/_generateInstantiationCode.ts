import type {AutogenerateAPIContext} from "#~src/autogenerate/AutogenerateAPIContext.ts"
import {getBaseModuleSpecifier} from "#~src/getBaseModuleSpecifier.ts"
import {getRuntimeImportSpecifier} from "../getRuntimeImportSpecifier.ts"

export function _generateInstantiationCode(
	apiContext: AutogenerateAPIContext,
	exportName: string,
	forceCompatibility: boolean
) {
	const castToAny = forceCompatibility === true ? " as any" : "";

	// we assume/know that the factory file is right beside
	// the instantiation file
	return `
import {getProject as enkoreGetProject} from "${getBaseModuleSpecifier(apiContext.target)}/project"
import {defineContextOptions as enkoreDefineContextOptions} from "${getRuntimeImportSpecifier(apiContext)}"
import {${exportName}Factory as factory} from "./${exportName}Factory.ts"

export const ${exportName} = /*@__PURE__*/ factory(
	/*@__PURE__*/ enkoreDefineContextOptions({
		project: /*@__PURE__*/ enkoreGetProject()${castToAny}
	})
)
`.slice(1)
}
