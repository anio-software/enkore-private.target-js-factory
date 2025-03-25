import type {API} from "#~src/API.d.mts"
import {createEntity} from "@enkore/spec"

const impl: API["getRealmDependenciesToInstall"] = async function() {
	return {
		"@enkore/rollup": createEntity(
			"EnkoreCoreRealmDependencyInstallSpecification", 0, 0, {
				version: "0.0.2",
				importKind: "star"
			}
		),
		"@enkore/typescript": createEntity(
			"EnkoreCoreRealmDependencyInstallSpecification", 0, 0, {
				version: "0.0.3",
				importKind: "star"
			}
		)
	}
}

export const getRealmDependenciesToInstall = impl
