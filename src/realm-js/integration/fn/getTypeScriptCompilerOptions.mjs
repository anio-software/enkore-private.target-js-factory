import {loadRealmDependencies} from "../../auto/base-realm.mjs"
import path from "node:path"
import fs from "node:fs/promises"

export default async function(fourtune_session) {
	const project_root = fourtune_session.getProjectRoot()

	const tsconfig_path = path.join(project_root, "tsconfig.json")
	const tsconfig_data = await fs.readFile(tsconfig_path)
	const tsconfig = JSON.parse(tsconfig_data.toString())

	const {
		getDependency
	} = await loadRealmDependencies(
		fourtune_session.getProjectRoot(), "realm-js"
	)

	const ts = getDependency("typescript")

	const {
		errors,
		options
	} = ts.convertCompilerOptionsFromJson(tsconfig.compilerOptions)

	if (errors.length) {
		for (const error of errors) {
			fourtune_session.addWarning(`ts`, error.messageText)
		}
	}

	return options
}
