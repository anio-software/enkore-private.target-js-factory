import type {AutogenerateAPIContext} from "#~src/autogenerate/AutogenerateAPIContext.ts"

export function getRuntimeImportSpecifier(
	apiContext: AutogenerateAPIContext
) {
	return `@anio-software/enkore.js-runtime/v0`
}
