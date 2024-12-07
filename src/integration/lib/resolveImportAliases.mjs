import path from "node:path"
import {getPathAliases} from "../../getPathAliases.mjs"

export async function resolveImportAliases(
	fourtune_session, code, source_file_path
) {
	const levels = path.dirname(source_file_path).split(path.sep).length

	const aliases = getPathAliases(`./${"../".repeat(levels)}/`)

	const {
		jsResolveImportAliases,
		tsResolveImportAliases
	} = fourtune_session.getDependency(
		"@fourtune/base-realm-js-and-web"
	)

	if (source_file_path.endsWith(".d.mts")) {
		return await tsResolveImportAliases(
			code, {aliases}
		)
	} else if (source_file_path.endsWith(".mts")) {
		return await jsResolveImportAliases(
			code, {aliases}
		)
	}

	return code
}
