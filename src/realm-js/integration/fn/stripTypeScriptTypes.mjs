import {loadRealmDependencies} from "../../auto/base-realm.mjs"
import path from "node:path"
import fs from "node:fs/promises"

// this function assumes "input_file" is a relative path
// to a file inside build/src/
export default async function(fourtune_session, input_file) {
	const project_root = fourtune_session.getProjectRoot()

	const {getDependency, getPathOfDependency} = await loadRealmDependencies(
		project_root, "realm-js"
	)

	const babel = getDependency("@babel/core")

	const levels = path.dirname(input_file).split(path.sep).length

	const code = (await fs.readFile(
		path.join(project_root, "build", "src", input_file)
	)).toString()

	const result = await babel.transformAsync(
		code, {
			presets: [
				[getPathOfDependency("@babel/preset-typescript"), {
					rewriteImportExtensions: true
				}]
			],
			filename: path.basename(input_file),
			plugins: [
				[getPathOfDependency("babel-plugin-module-resolver"), {
					alias: {
						"#": "./" + ("./../".repeat(levels))
					}
				}]
			]
		}
	)

	return result.code
}
