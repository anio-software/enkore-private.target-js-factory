import path from "node:path"
import readJSONFile from "./util/readJSONFile.mjs"
import loadFourtuneConfig from "./loadFourtuneConfig.mjs"
import getRuntimeVersionString from "./getRuntimeVersionString.mjs"

//
// Generates the runtime init data needed.
// This includes:
//
//.   - Contents of fourtune.config.mjs.
//    - The project's package.json contents (retrievable via getProjectPackageJSON)
//
export default async function(project_root) {
	const project_package_json = await readJSONFile(
		path.join(project_root, "package.json")
	)

	return {
		runtime_version: await getRuntimeVersionString(project_root),
		package_json: project_package_json,
		fourtune_config: await loadFourtuneConfig(project_root)
	}
}
