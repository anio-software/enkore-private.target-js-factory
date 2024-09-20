import path from "node:path"
import fs from "node:fs/promises"

import {loadRealmDependencies} from "../../../../../auto/base-realm.mjs"

import {fileURLToPath} from "node:url"

const __dirname = path.dirname(
	fileURLToPath(import.meta.url)
)

async function useDependency(fourtune_session, dependency_name) {
	//
	// this only works for @anio-js-foundation modules
	// because they all have ./dist/package.mjs as entry point
	//
	const {
		getPathOfDependency,
		loadDependencyPackageJSON
	} = await loadRealmDependencies(
		fourtune_session.getProjectRoot(), "realm-js"
	)

	const dependency_root = getPathOfDependency(dependency_name)
	const dependency_entry_path = path.join(
		dependency_root, "dist", "package.mjs"
	)
	const package_json = loadDependencyPackageJSON(dependency_name)

	let source = ""

	source += "\n"
	source += `// this is the bundled version of\n`
	source += `// ${dependency_name} version ${package_json.version}\n`
	source += "\n"

	source += await fs.readFile(dependency_entry_path)

	return fourtune_session.autogenerate.warningComment() + source
}

export default async function(fourtune_session, file_path, support_file) {
	if (support_file === "createModifierFunction.mjs") {
		return await useDependency(fourtune_session, "@anio-js-foundation/create-modifier-function")
	} else if (support_file === "createNamedAnonymousFunction.mjs") {
		return await useDependency(fourtune_session, "@anio-js-foundation/create-named-anonymous-function")
	}

	const support_file_path = path.join(__dirname, "support_files", support_file)

	return fourtune_session.autogenerate.warningComment() + (await fs.readFile(support_file_path))
}
