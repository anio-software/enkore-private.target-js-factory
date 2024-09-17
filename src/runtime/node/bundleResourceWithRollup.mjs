import path from "node:path"

export default async function(
	project_root,
	rollup_plugin,
	build_dependencies,
	resource_path
) {
	const {rollup, rollupResolveNode} = build_dependencies

	const rollup_options = {
		input: path.join(project_root, "resources", "esmodule", resource_path),

		output: {
			//file: "/dev/null",
			format: "es"//,
			//inlineDynamicImports: true
		},

		plugins: [rollup_plugin({resource_path}), rollupResolveNode()]
	}

	// needed for rollup-node-resolve plugin
	const saved_cwd = process.cwd()
	process.chdir(project_root)

	try {
		const bundle = await rollup(rollup_options)

		const {output} = await bundle.generate({})

		return output[0].code
	} finally {
		process.chdir(saved_cwd)
	}
}
