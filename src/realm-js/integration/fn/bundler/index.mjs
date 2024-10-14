import process from "node:process"
import {loadRealmDependencies} from "../../../auto/base-realm.mjs"
import fourtuneRollupPlugin from "../../../auto/plugin.mjs"
import getTypeScriptCompilerOptions from "../getTypeScriptCompilerOptions.mjs"
import path from "node:path"

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

	const virtual_entries = {}

	//
	// use file extension for virtual entry point
	// since tsc has some problems without it?
	//
	const virtual_entry_point = `virtual_entry_point.${options.entry_file_type}`

	virtual_entries[virtual_entry_point] = options.entry

	const rollup_plugins = [virtual(virtual_entries)]

	if (options.entry_file_type === "d.mts") {
		const compiler_options = await getTypeScriptCompilerOptions(fourtune_session)

		//
		// resolve #/ and map .mts imports to .d.mts
		//
		rollup_plugins.push({
			resolveId(id) {
				if (id.startsWith("#/")) {
					id = id.slice(2)

					id = path.join(
						project_root, "objects", "src", id
					)

					const is_mts_file = id.endsWith(".mts") && !id.endsWith(".d.mts")

					//
					// resolve .mts files to d.mts
					//
					if (is_mts_file) {
						return {
							id: id.slice(0, -4) + ".d.mts"
						}
					} else {
						return {id}
					}
				}

				return null
			}
		})

		rollup_plugins.push(dts({
			respectExternal: true,
			compilerOptions: {
				...compiler_options,
				//
				// overwrite paths alias since
				// those will be resolved by rollup plugin
				//
				paths: {}
			}
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
		input: virtual_entry_point,

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
