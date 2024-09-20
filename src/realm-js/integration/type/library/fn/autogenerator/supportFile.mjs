import path from "node:path"
import fs from "node:fs/promises"
import {fileURLToPath} from "node:url"

const __dirname = path.dirname(
	fileURLToPath(import.meta.url)
)

async function useDependency(fourtune_session, dependency_name) {
	//
	// this only works for @anio-js-foundation modules
	// because they all have ./dist/package.mjs as entry point
	//
	const dependency_entry_path = fileURLToPath(import.meta.resolve(dependency_name))

	if (!dependency_entry_path.endsWith("/dist/package.mjs")) {
		throw new Error(`Not a @anio-js-foundation module.`)
	}

	const dependency_root = path.resolve(path.dirname(dependency_entry_path), "..")
	const package_json = JSON.parse(await fs.readFile(
		path.join(dependency_root, "package.json")
	))

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
