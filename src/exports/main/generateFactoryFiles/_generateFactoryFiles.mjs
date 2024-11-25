import {getPaths} from "./getPaths.mjs"
import {_generateFunctionCode} from "./_generateFunctionCode.mjs"
import path from "node:path"
import fs from "node:fs/promises"

export function _generateFactoryFiles(
	options
) {
	let ret = {}
	const paths = getPaths(options)

	ret[paths.output.fn] = async (fourtune_session) => {
		const source_code = (await fs.readFile(
			path.join(fourtune_session.getProjectRoot(), options.source_file)
		)).toString()

		const base = await fourtune_session.getDependency("@fourtune/base-realm-js-and-web")

		const {
			tsGenerateFunctionFactoryCode
		} = base

		const {fn} = await tsGenerateFunctionFactoryCode(
			paths,
			source_code,
			null
		)

		return fn
	}

	ret[paths.output.factory] = async (fourtune_session) => {
		const source_code = (await fs.readFile(
			path.join(fourtune_session.getProjectRoot(), options.source_file)
		)).toString()

		const base = await fourtune_session.getDependency("@fourtune/base-realm-js-and-web")

		const {
			tsGenerateFunctionFactoryCode
		} = base

		const {factory} = await tsGenerateFunctionFactoryCode(
			paths,
			source_code,
			null
		)

		return factory
	}

	return ret
}
