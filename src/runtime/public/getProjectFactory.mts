import type {RuntimeAPI} from "#~src/runtime/RuntimeAPI.d.mts"
import type {RuntimeAPIContext} from "#~src/runtime/RuntimeAPIContext.d.mts"
import {createEntity} from "@enkore/spec"

const impl: RuntimeAPI["getProject"] = function(
	this: RuntimeAPIContext
) {
	return createEntity("EnkoreJSRuntimeProject", 0, 0, {
		enkoreConfiguration: JSON.parse(JSON.stringify(this.projectConfig)),
		packageJSON: JSON.parse(JSON.stringify(this.projectPackageJSON))
	})
}

export function getProjectFactory(context: RuntimeAPIContext) {
	return impl!.bind(context)
}
