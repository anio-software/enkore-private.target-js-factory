import type {ProjectAPI} from "../ProjectAPI.mts"
import type {ProjectAPIContext} from "../ProjectAPIContext.mts"
import {createEntity} from "@enkore/spec"

const impl: ProjectAPI["getProject"] = function(
	this: ProjectAPIContext
) {
	return createEntity("EnkoreJSRuntimeProject", 0, 0, {
		projectId: this.projectId,
		enkoreConfiguration: JSON.parse(JSON.stringify(this.projectConfig)),
		packageJSON: JSON.parse(JSON.stringify(this.projectPackageJSON))
	})
}

export function getProjectFactory(context: ProjectAPIContext) {
	return impl!.bind(context)
}
