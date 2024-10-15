import path from "node:path"
import {loadRealmDependencies} from "../auto/base-realm.mjs"
import getTypeScriptCompilerOptions from "./fn/getTypeScriptCompilerOptions.mjs"
import invokeTypeScript from "./fn/invokeTypeScript.mjs"

export default async function(fourtune_session) {
	const input_files = fourtune_session.getProjectSourceFiles().filter(({relative_path}) => {
		return relative_path.endsWith(".mts")
	}).map(({relative_path}) => {
		return path.join("build", "src", relative_path)
	})

	const project_root = fourtune_session.getProjectRoot()

	const {getDependency} = await loadRealmDependencies(
		project_root, "realm-js"
	)

	const ts = getDependency("typescript")

	const compiler_options = {
		...await getTypeScriptCompilerOptions(fourtune_session),
		allowJs: true,
		checkJs: true,
		noEmit: true
	}

	const {diagnostic_messages} = await invokeTypeScript(ts, input_files, compiler_options)

	for (const {code, message} of diagnostic_messages) {
		fourtune_session.addWarning(`ts-${code}`, message)
	}
}
