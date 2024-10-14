import {loadRealmDependencies} from "../../auto/base-realm.mjs"
import getTypeScriptCompilerOptions from "./getTypeScriptCompilerOptions.mjs"
import path from "node:path"

export default async function(fourtune_session) {
	const project_root = fourtune_session.getProjectRoot()

	const input_files = fourtune_session.getProjectSourceFiles().filter(({relative_path}) => {
		if (relative_path.endsWith(".d.mts")) return false

		return relative_path.endsWith(".mts")
	}).map(({relative_path}) => {
		return path.join("build", "src", relative_path)
	})

	const {getDependency} = await loadRealmDependencies(
		project_root, "realm-js"
	)

	const ts = getDependency("typescript")

	const compiler_options = {
		...await getTypeScriptCompilerOptions(fourtune_session),
		allowJs: false,
		declaration: true,
		emitDeclarationOnly: true,
		noEmitOnError: true
	}

	//
	// write files into memory, not on disk
	//
	const host = ts.createCompilerHost(compiler_options)

	let memfs = new Map()

	host.writeFile = (file_path, contents) => {
		if (file_path.startsWith(project_root + "/")) {
			file_path = file_path.slice(project_root.length + 1)
		}

		memfs.set(file_path, contents)
	}

	const program = ts.createProgram(input_files, compiler_options, host)

	const result = program.emit()

	console.log("ts has errors?", result.emitSkipped)

	if (result.emitSkipped) return

	return memfs
}
