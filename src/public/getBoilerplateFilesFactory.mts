import type {API} from "#~src/API.d.mts"
import type {APIContext} from "#~src/APIContext.d.mts"
import {createEntity} from "@enkore/spec"
import {getAsset} from "@fourtune/realm-js/v0/assets"

const impl: API["getBoilerplateFiles"] = async function(
	this: APIContext, session
) {
	function defineFile(path: string, content: string, overwrite?: boolean) {
		return createEntity("EnkoreBoilerplateFile", 0, 0, {
			scope: "target",
			content,
			path,
			overwrite
		})
	}

	const tsconfigBase = JSON.parse(getAsset("text://tsconfig/base.json") as string)

	if (this.target === "js-node") {
		tsconfigBase.compilerOptions.types.push("node")
	} else if (this.target === "js-web") {
		tsconfigBase.compilerOptions.types.push("web")
	}

	return [
		defineFile("tsconfig.json", getAsset("text://tsconfig/tsconfig.json") as string, true),
		defineFile("tsconfig/base.json", JSON.stringify(tsconfigBase, null, 4) + "\n", true),
		defineFile("tsconfig/src.json", getAsset("text://tsconfig/src.json") as string, true),
		defineFile("tsconfig/assets.json", getAsset("text://tsconfig/assets.json") as string, true)
	]
}

export function getBoilerplateFilesFactory(context: APIContext) {
	return impl!.bind(context)
}
