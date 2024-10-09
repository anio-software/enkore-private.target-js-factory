import runBundler from "../../fn/bundler/index.mjs"
import buildSourceFile from "../../fn/builder/sourceFile.mjs"
import path from "node:path"

export default async function(fourtune_session, module_name, module_exports) {
	let index_dts_file = ``
	let index_mjs_file = ``

	for (const [key, module_export] of module_exports) {
		// src_file is the source file that is written in typescript
		const src_file = "./" + module_export.path
		// build_file is the source file with all typescript info stripped
		const build_file = "./" + path.join("build", module_export.path)

		const importStatement = (source) => {
			const source_str = JSON.stringify(source)

			//
			// treat __index differently so such
			// that this export may manually export
			// other things.
			//
			if (module_export.export_name === "__index") {
				return `export * from ${source_str}`
			} else {
				//
				// Normally, the file name is used to
				// create a named export in the output module.
				// This means, myFunction.mjs would be exported as
				// "myFunction"
				//
				return `export {${module_export.export_name}} from ${source_str}`
			}
		}

		if (module_export.type === "mts") {
			index_mjs_file += importStatement(build_file) + "\n"
			index_dts_file += importStatement(src_file) + "\n"
		} else if (module_export.type === "d.mts") {
			index_dts_file += importStatement(src_file) + "\n"
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
