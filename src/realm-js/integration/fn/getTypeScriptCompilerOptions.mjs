import {loadRealmDependencies} from "../../auto/base-realm.mjs"
import path from "node:path"

// source: https://github.com/microsoft/TypeScript/issues/5276#issuecomment-148926002
function convertConfigToCompilerOptions(ts, opts) {
	const parsed = ts.parseJsonConfigFileContent(
		{
			compilerOptions: opts,
			// if files are not specified then parseJsonConfigFileContent 
			// will use ParseConfigHost to collect files in containing folder
			files: []
		},
		// we don't do any file lookups - host and base folders should not be used
		undefined, 
		undefined
	)

	return parsed.options;
}

export default async function(fourtune_session) {
	const project_root = fourtune_session.getProjectRoot()

	const tsconfig_path = path.join(project_root, "tsconfig.json")
	const tsconfig_data = await fs.readFile(tsconfig_path)
	const tsconfig = JSON.pare(tsconfig_data.toString())

	const {
		getDependency
	} = await loadRealmDependencies(
		fourtune_session.getProjectRoot(), "realm-js"
	)

	const ts = getDependency("typescript")

	return convertConfigToCompilerOptions(ts, tsconfig)
}
