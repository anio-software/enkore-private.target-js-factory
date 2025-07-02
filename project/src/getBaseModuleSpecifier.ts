import type {TargetJSIdentifier} from "./TargetJSIdentifier.ts"

export function getBaseModuleSpecifier(
	identifier: TargetJSIdentifier
) {
	return `@anio-software/enkore.target-${identifier}`
}
