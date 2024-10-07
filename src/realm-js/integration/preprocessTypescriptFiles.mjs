import {loadRealmDependencies} from "../auto/base-realm.mjs"
import path from "node:path"

export default async function(fourtune_session, relative_path, code) {
	// only pre-process typescript files
	if (!relative_path.endsWith(".mts")) return code

	const project_root = fourtune_session.getProjectRoot()

	const {
		getDependency,
		getPathOfDependency
	} = await loadRealmDependencies(project_root, "realm-js")

	const babel = getDependency("@babel/core")

	const result = await babel.transformAsync(
		code, {
			presets: [
				getPathOfDependency("@babel/preset-typescript")
			],
			filename: path.basename(relative_path)
		}
	)

	return result.code
}
