import path from "node:path"
import readJSONFile from "./util/readJSONFile.mjs"
import {createRequire} from "node:module"

async function loadPackageJSONs(project_root) {
	const require1 = createRequire(path.join(project_root, "index.js"))
	const realm_package_json = require1.resolve("@4tune/realm-js-and-web-base/package.json")

	const require2 = createRequire(realm_package_json)
	const runtime_package_json = require2.resolve("@4tune/js-and-web-runtime/package.json")

	return {
		base: await readJSONFile(realm_package_json),
		runtime: await readJSONFile(runtime_package_json)
	}
}

export default async function(project_root) {
	return ""
	/*
	const {base, runtime} = await loadPackageJSONs(project_root)

	return `base ${base.version} @ runtime ${runtime.version}`
	*/
}
