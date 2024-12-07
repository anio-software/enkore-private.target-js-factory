import path from "node:path"
import {getPathAliases} from "../../getPathAliases.mjs"

export async function resolveImportAliases(
	fourtune_session, code, source_file_path
) {
	const levels = path.dirname(source_file_path).split(path.sep).length

	const aliases = getPathAliases(`./${"../".repeat(levels)}/`)

	const {
		tsResolveImportAliases
	} = fourtune_session.getDependency(
		"@fourtune/base-realm-js-and-web"
	)

	// both catches .d.mts and .mts
	if (source_file_path.endsWith(".mts")) {
		return await tsResolveImportAliases(
			code, {aliases}
		)
	}

	return code
}
