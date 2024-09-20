import path from "node:path"
import readJSONFile from "./util/readJSONFile.mjs"
import {createRequire} from "node:module"

export default async function(project_root) {
	const require = createRequire(path.join(project_root, "index.js"))
	const runtime_path = require.resolve("@fourtune/realm-js/package.json")
	const runtime = await readJSONFile(runtime_path)

	const base_realm_version_path = require.resolve("@fourtune/realm-js/base-realm/version")
	const {default: base_realm_version} = await import(base_realm_version_path)

	return `v${runtime.version} [base v${base_realm_version}]`
}
