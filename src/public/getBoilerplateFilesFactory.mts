import type {API} from "#~src/API.d.mts"
import type {APIContext} from "#~src/APIContext.d.mts"
import {createEntity} from "@enkore/spec"
import {getAsset} from "@fourtune/realm-js/v0/assets"

const impl: API["getBoilerplateFiles"] = async function(
	this: APIContext, session
) {
	const realmConfig = session.realm.getConfig("js")
	let isNodeEnvironment = false

	if (realmConfig.runtime === "node" || realmConfig.runtime === "agnostic") {
		isNodeEnvironment = true
	}

	function defineFile(path: string, content: string, overwrite?: boolean) {
		return createEntity("EnkoreBoilerplateFile", 0, 0, {
			scope: "realm",
			content,
			path,
			overwrite
		})
	}

	const tsconfigBase = JSON.parse(getAsset("text://tsconfig/base.json") as string)

	if (isNodeEnvironment) {
		tsconfigBase.compilerOptions.types.push("node")
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
