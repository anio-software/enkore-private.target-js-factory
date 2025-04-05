import type {RuntimeAPI} from "#~src/runtime/RuntimeAPI.d.mts"
import type {RuntimeAPIContext} from "#~src/runtime/RuntimeAPIContext.d.mts"

const impl: RuntimeAPI["getProject"] = function(
	this: RuntimeAPIContext
) {
	return {
		enkoreConfiguration: JSON.parse(JSON.stringify(this.projectConfig)),
		packageJSON: JSON.parse(JSON.stringify(this.projectPackageJSON))
	}
}

export function getProjectFactory(context: RuntimeAPIContext) {
	return impl!.bind(context)
}
