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
	const virtual = getDependency("@rollup/plugin-virtual")
	// -- dependencies --

	const cwd = process.cwd()

	//
	// needed for @rollup/plugin-node-resolve AND
	// @rollup/plugin-virtual
	//
	process.chdir(project_root)

	const rollup_plugins = []
	let rollup_entry = options.entry

	if ("entry_code" in options) {
		rollup_plugins.push(virtual({
			"virtual_entry_point": options.entry_code
		}))

		rollup_entry = "virtual_entry_point"
	}

	if (options.entry.endsWith("d.ts")) {
		rollup_plugins.push(dts({respectExternal: true}))
	} else {
		rollup_plugins.push(await fourtuneRollupPlugin(project_root))
		rollup_plugins.push(resolve())
	}

	if (options.minified) {
		rollup_plugins.push(terser())
	}

	const rollup_options = {
		input: rollup_entry,

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
