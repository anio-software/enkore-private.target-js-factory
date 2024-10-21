import runBundler from "../../fn/bundler/index.mjs"
import buildSourceFile from "../../fn/builder/sourceFile.mjs"
import path from "node:path"

export default async function(fourtune_session, module_name, module_exports) {
	let index_dts_file = ``
	let index_mjs_file = ``

	for (const [export_name, source] of module_exports) {
		let export_base_path = "", export_type = ""

		if (source.endsWith(".d.mts")) {
			export_type = "d.mts"
			export_base_path = source.slice(0, -(".d.mts".length))
		} else {
			export_type = "mts"
			export_base_path = source.slice(0, -(".mts".length))
		}

		export_base_path = "./" + path.join("objects", "src", export_base_path)

		const importStatement = (source, is_type = false) => {
			const source_str = JSON.stringify(source)
			const t_export = is_type ? " type" : ""

			//
			// treat __star_export differently so such
			// that this export may manually export
			// other things.
			//
			if (export_name === "__star_export") {
				return `export${t_export} * from ${source_str}`
			} else if (export_name === "__default") {
				return `export${t_export} {default} from ${source_str}`
			} else {
				//
				// Normally, the file name is used to
				// create a named export in the output module.
				// This means, myFunction.mjs would be exported as
				// "myFunction"
				//
				return `export${t_export} {${export_name}} from ${source_str}`
			}
		}

		if (export_type === "mts") {
			index_mjs_file += importStatement(`${export_base_path}.mjs`) + "\n"
			index_dts_file += importStatement(`${export_base_path}.d.mts`, true) + "\n"
		} else if (export_type === "d.mts") {
			index_dts_file += importStatement(`${export_base_path}.d.mts`, true) + "\n"
		}
	}

	fourtune_session.distributables.addFile(`${module_name}/index.d.mts`, {
		async generator() {
			return await runBundler(fourtune_session, {
				entry: index_dts_file,
				entry_file_type: "d.mts"
			})
		},
		generator_args: []
	})

	fourtune_session.distributables.addFile(`${module_name}/index.mjs`, {
		async generator() {
			return await runBundler(fourtune_session, {
				entry: index_mjs_file,
				entry_file_type: "mjs"
			})
		},
		generator_args: []
	})

	fourtune_session.distributables.addFile(`${module_name}/index.min.mjs`, {
		async generator() {
			return await runBundler(fourtune_session, {
				entry: index_mjs_file,
				entry_file_type: "mjs",
				minified: true
			})
		},
		generator_args: []
	})

	// provide source as javascript module
	fourtune_session.distributables.addFile(`${module_name}/source.mjs`, {generator: buildSourceFile, generator_args: [`${module_name}/index.mjs`]})
	fourtune_session.distributables.addFile(`${module_name}/source.min.mjs`, {generator: buildSourceFile, generator_args: [`${module_name}/index.min.mjs`]})
}
