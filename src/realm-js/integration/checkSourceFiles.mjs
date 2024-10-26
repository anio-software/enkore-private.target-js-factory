import path from "node:path"
import {loadRealmDependencies} from "fourtune/base-realm"
import {scandir} from "@anio-software/fs"

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

	const project_source_files = fourtune_session.getProjectSourceFiles().filter(({relative_path}) => {
		return relative_path.endsWith(".mts")
	}).map(({relative_path}) => {
		return path.join("build", "src", relative_path)
	})

	const project_ts_resources = await scandir(
		"./resources/tsmodule", {
			allow_missing_dir: true,
			map({relative_path}) {
				return path.join("resources", "tsmodule", relative_path)
			}
		}
	)

	const input_files = [
		...project_source_files,
		...project_ts_resources
	]

	// todo: use tsconfig.src.json for src/ files and tsconfig.resources.json for resources/tsmodule files.
	const compiler_options = {
		...await tsReadTSConfigFile(
			path.join(project_root, "tsconfig.base.json"), project_root
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
