import rollupNodeResolve from "@rollup/plugin-node-resolve"
import {rollup} from "rollup"

function createConfigForEntryPoint(entry, additional_plugins) {
	let plugins = [...additional_plugins, rollupNodeResolve()]

	return {
		input: entry,
		output: {
			//file: output,
			format: "es"
		},

		plugins
	}
}

export default async function(file, additional_plugins = []) {
	const bundle = await rollup(
		createConfigForEntryPoint(file, additional_plugins)
	)

	const {output} = await bundle.generate({})

	return output[0].code
}
