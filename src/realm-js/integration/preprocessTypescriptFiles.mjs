import {loadRealmDependencies} from "../auto/base-realm.mjs"
import path from "node:path"

export default async function(fourtune_session, relative_path, code) {
	// only pre-process typescript files
	if (!relative_path.endsWith(".mts")) return code

	// remove .d.mts or .mts from file name
	let bare_filename = path.basename(relative_path)

	if (relative_path.endsWith(".d.mts")) {
		bare_filename = bare_filename.slice(0, -(".d.mts".length))
	} else {
		bare_filename = bare_filename.slice(0, -(".mts".length))
	}

	const project_root = fourtune_session.getProjectRoot()

	const {
		getDependency,
		getPathOfDependency
	} = await loadRealmDependencies(project_root, "realm-js")

	const babel = getDependency("@babel/core")

	const levels = path.dirname(relative_path).split(path.sep).length

	const result = await babel.transformAsync(
		code, {
			presets: [
				[getPathOfDependency("@babel/preset-typescript"), {
					rewriteImportExtensions: true
				}]
			],
			filename: path.basename(relative_path),
			plugins: [
				[getPathOfDependency("babel-plugin-module-resolver"), {
					alias: {
						"#": "./" + ("./../".repeat(levels))
					}
				}]
			]
		}
	)

	let typing_file = []

	if (relative_path.endsWith(".d.mts")) {
		typing_file = [{
			new_filename: path.basename(relative_path),
			code
		}]
	}

	return [{
		new_filename: `${bare_filename}.mjs`,
		code: result.code
	}, ...typing_file]
}
