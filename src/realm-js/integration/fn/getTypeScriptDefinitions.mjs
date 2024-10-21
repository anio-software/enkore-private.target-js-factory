import {loadRealmDependencies} from "../../auto/base-realm.mjs"
import path from "node:path"

export default async function(fourtune_session) {
	const project_root = fourtune_session.getProjectRoot()

	const {getDependency} = await loadRealmDependencies(
		project_root, "realm-js"
	)

	const {
		ts,
		tsReadTSConfigFile,
		tsInvokeTypeScript
	} = getDependency("@fourtune/base-realm-js-and-web")

	const compiler_options = {
		...await tsReadTSConfigFile(
			path.join(project_root, "tsconfig.json")
		),
		allowJs: false,
		declaration: true,
		emitDeclarationOnly: true,
		noEmitOnError: true
	}

	compiler_options.paths = {
		...compiler_options.paths,
		// overwrite # alias to point to "build/src" instead of "src/"
		"#/*": ["./build/src/*"]
	}

	const input_files = fourtune_session.getProjectSourceFiles().filter(({relative_path}) => {
		if (
			!relative_path.startsWith("auto/export/") &&
			!relative_path.startsWith("export/")
		) return false

		if (relative_path.endsWith(".d.mts")) return false

		return relative_path.endsWith(".mts")
	}).map(({relative_path}) => {
		return path.join("build", "src", relative_path)
	})

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

	const {errors, diagnostic_messages}  = await tsInvokeTypeScript(
		host, input_files, compiler_options
	)

	if (errors) {
		for (const {message} of diagnostic_messages) {
			fourtune_session.emitError(`tsc`, message)
		}

		return null
	}

	return memfs
}
