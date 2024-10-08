import process from "node:process"
import {loadRealmDependencies} from "../../../auto/base-realm.mjs"
import fourtuneRollupPlugin from "../../../auto/plugin.mjs"
import getTypeScriptCompilerOptions from "../getTypeScriptCompilerOptions.mjs"

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
	const virtual = getDependency("@rollup/plugin-virtual")
	// -- dependencies --

	const cwd = process.cwd()

	//
	// needed for @rollup/plugin-node-resolve AND
	// @rollup/plugin-virtual
	//
	process.chdir(project_root)

	const rollup_plugins = [virtual({
		"virtual_entry_point": options.entry
	})]

	if (options.entry_file_type === "d.mts") {
		const compiler_options = await getTypeScriptCompilerOptions(fourtune_session)

		rollup_plugins.push(dts({
			respectExternal: true,
			compilerOptions: compiler_options
		}))

		//
		// make warning "[warn] rollup says "node:fs" is imported by "src/methods/lstat.mts", but could not be resolved – treating it as an external dependency." go away
		//
		rollup_plugins.push({
			resolveId(id) {
				if (id.startsWith("node:")) {
					return {id, external: true}
				}

				return null
			}
		})
	} else if (options.entry_file_type === "mjs") {
		rollup_plugins.push(await fourtuneRollupPlugin(project_root))
		rollup_plugins.push(resolve())
	} else {
		throw new Error(`Invalid file type '${options.entry_file_type}'.`)
	}

	if (options.minified) {
		rollup_plugins.push(terser())
	}

	const rollup_options = {
		input: "virtual_entry_point",

		output: {},

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

		const {output} = await bundle.generate({
			format: "es"
			//inlineDynamicImports: true
		})

		return output[0].code
	} finally {
		process.chdir(cwd)
	}
}
