import type {ProjectAPI} from "#~src/project/ProjectAPI.d.mts"
import type {ProjectAPIContext} from "#~src/project/ProjectAPIContext.d.mts"
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
