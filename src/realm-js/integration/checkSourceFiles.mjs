import path from "node:path"
import {loadRealmDependencies} from "../auto/base-realm.mjs"

export default async function(fourtune_session) {
	const project_root = fourtune_session.getProjectRoot()

	const {getDependency} = await loadRealmDependencies(
		project_root, "realm-js"
	)

	const {
		ts,
		tsReadTSConfigFile,
		tsInvokeTypeScript
	} = getDependency(
		"@fourtune/base-realm-js-and-web"
	)

	const input_files = fourtune_session.getProjectSourceFiles().filter(({relative_path}) => {
		return relative_path.endsWith(".mts")
	}).map(({relative_path}) => {
		return path.join("build", "src", relative_path)
	})

	const compiler_options = {
		...await tsReadTSConfigFile(
			path.join(project_root, "tsconfig.json"), project_root
		),
		allowJs: true,
		checkJs: true,
		noEmit: true
	}

	const {diagnostic_messages} = await tsInvokeTypeScript(
		null, input_files, compiler_options
	)

	for (const {code, message} of diagnostic_messages) {
		fourtune_session.addWarning(`ts-${code}`, message)
	}
}
