import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import {createEntity} from "@enkore/spec"

const impl: API["getDependenciesToInstall"] = async function(
	this: APIContext
) {
	return {
		"@enkore/target-js-toolchain": createEntity(
			"EnkoreCoreTargetDependencyInstallSpecification", 0, 0, {
				version: "0.0.2",
				importKind: "star"
			}
		),
		"@enkore/rollup": createEntity(
			"EnkoreCoreTargetDependencyInstallSpecification", 0, 0, {
				version: "0.0.3",
				importKind: "star"
			}
		),
		"@enkore/typescript": createEntity(
			"EnkoreCoreTargetDependencyInstallSpecification", 0, 0, {
				version: "0.0.16",
				importKind: "star"
			}
		),
		"@enkore/babel": createEntity(
			"EnkoreCoreTargetDependencyInstallSpecification", 0, 0, {
				version: "0.0.24",
				importKind: "star"
			}
		)
	}
}

export function getDependenciesToInstallFactory(context: APIContext) {
	return impl!.bind(context)
}
