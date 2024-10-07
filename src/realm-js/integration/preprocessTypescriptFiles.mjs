import {loadRealmDependencies} from "../auto/base-realm.mjs"

export default async function(fourtune_session, relative_path, code) {
	if (!relative_path.endsWith(".mts")) return code

	const project_root = fourtune_session.getProjectRoot()

	const {
		getDependency,
		getPathOfDependency
	} = await loadRealmDependencies(project_root)

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
