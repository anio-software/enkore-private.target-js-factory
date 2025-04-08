import type {ProjectAPI} from "#~src/runtime/ProjectAPI.d.mts"
import type {ProjectAPIContext} from "#~src/runtime/ProjectAPIContext.d.mts"
import {createEntity} from "@enkore/spec"

const impl: ProjectAPI["getProject"] = function(
	this: ProjectAPIContext
) {
	return createEntity("EnkoreJSRuntimeProject", 0, 0, {
		enkoreConfiguration: JSON.parse(JSON.stringify(this.projectConfig)),
		packageJSON: JSON.parse(JSON.stringify(this.projectPackageJSON))
	})
}

export function getProjectFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
