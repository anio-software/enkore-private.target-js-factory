import runBundler from "../../fn/bundler/index.mjs"
import buildSourceFile from "../../fn/builder/sourceFile.mjs"

export default async function(fourtune_session, module_name, module_exports) {
	let index_dts_file = ``
	let index_mjs_file = ``

	for (const [key, module_export] of module_exports) {
		const src_file = JSON.stringify("./" + module_export.path)

		if (module_export.type === "d.ts") {
			index_dts_file += `export * from ${src_file}\n`
		} else if (module_export.type === "mjs") {
			if (module_export.export_name === "index") {
				index_mjs_file += `export * from ${src_file}\n`
			} else {
				index_mjs_file += `export {default as ${module_export.export_name}} from ${src_file}\n`
			}
		}
	}

	fourtune_session.distributables.addFile(`${module_name}/index.d.ts`, {
		async generator() {
			return await runBundler(fourtune_session, {
				entry: index_dts_file,
				entry_file_type: "d.ts"
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
