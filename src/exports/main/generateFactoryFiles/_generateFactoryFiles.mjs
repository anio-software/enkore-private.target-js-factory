import {getPaths} from "./getPaths.mjs"
import {_generateFunctionCode} from "./_generateFunctionCode.mjs"
import {_generateFactoryCode} from "./_generateFactoryCode.mjs"
import path from "node:path"
import fs from "node:fs/promises"

export function _generateFactoryFiles(
	options
) {
	let ret = {}
	const paths = getPaths(options)

	ret[paths.output.fn] = () => _generateFunctionCode(
		path.join("#~auto", paths.output.factory),
		paths.source,
		options.export_name
	)

	ret[paths.output.factory] = async (fourtune_session) => {
		const source_code = (await fs.readFile(
			path.join(fourtune_session.getProjectRoot(), options.source_file)
		)).toString()

		const base = await fourtune_session.getDependency("@fourtune/base-realm-js-and-web")
		const {
			tsGetDeclaredAnioSoftwareDependenciesFromCode,
			tsGetExportedFunctionFromCode
		} = base

		const dependencies = await tsGetDeclaredAnioSoftwareDependenciesFromCode(
			source_code
		)

		const {is_async} = await tsGetExportedFunctionFromCode(
			source_code, "implementation"
		)

		return _generateFactoryCode(
			paths.source,
			"implementation",
			path.basename(paths.output.factory).slice(0, -4),
			dependencies,
			is_async
		)
	}

	return ret
}
