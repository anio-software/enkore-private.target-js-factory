import process from "node:process"
import {loadRealmDependencies} from "../../../auto/base-realm.mjs"
import fourtuneRollupPlugin from "../../../auto/plugin.mjs"

export default async function(fourtune_session, options) {
	const project_root = fourtune_session.getProjectRoot()
	const {getDependency} = await loadRealmDependencies(
		project_root, "realm-js"
	)

	// -- dependencies --
	const rollup = getDependency("rollup")
	const resolve = getDependency("@rollup/plugin-node-resolve")
	const terser = getDependency("@rollup/plugin-terser")
	const dts = getDependency("rollup-plugin-dts")
	// -- dependencies --

	const cwd = process.cwd()

	//
	// needed for rollup-node-resolve plugin
	//
	process.chdir(project_root)

	const rollup_plugins = options.entry.endsWith("d.ts") ? [dts({
		respectExternal: true
	})] : [await fourtuneRollupPlugin(project_root), resolve()]

	if (options.minified) {
		rollup_plugins.push(terser())
	}

	const rollup_options = {
		input: options.entry,

		output: {
			//file: output_file_path,
			format: "es"//,
			//inlineDynamicImports: true
		},

		//
		// custom plugin has the responsibility
		// to resolve "@fourtune/realm-js" to a ''virtual'' module
		// to support loading resources seamlessly
		//
		plugins: rollup_plugins,

		onLog(level, error, handler) {
			fourtune_session.addWarning("rollup", {message: `[${level}] rollup says ${error.message}`})
		}
	}

	try {
		const bundle = await rollup(rollup_options)

		const {output} = await bundle.generate({})

		return output[0].code
	} finally {
		process.chdir(cwd)
	}
}
