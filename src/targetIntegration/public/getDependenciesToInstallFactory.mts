import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import {createEntity} from "@enkore/spec"

const impl: API["getDependenciesToInstall"] = async function(
	this: APIContext
) {
	return {
		"@enkore/rollup": createEntity(
			"EnkoreCoreTargetDependencyInstallSpecification", 0, 0, {
				version: "0.0.2",
				importKind: "star"
			}
		),
		"@enkore/typescript": createEntity(
			"EnkoreCoreTargetDependencyInstallSpecification", 0, 0, {
				version: "0.0.9",
				importKind: "star"
			}
		)
	}
}

export function getDependenciesToInstallFactory(context: APIContext) {
	return impl!.bind(context)
}
