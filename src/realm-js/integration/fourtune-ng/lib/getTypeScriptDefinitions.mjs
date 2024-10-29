import path from "node:path"

export async function getTypeScriptDefinitions(
	fourtune_session,
	input_files
) {
	const project_root = fourtune_session.getProjectRoot()

	const {
		ts,
		tsReadTSConfigFile,
		tsInvokeTypeScript
	} = await fourtune_session.getDependency("@fourtune/base-realm-js-and-web")

	// todo: handle tsconfig.src.json/tsconfig.resources.json correctly
	const compiler_options = {
		...await tsReadTSConfigFile(
			path.join(project_root, "auto", "cfg", "tsconfig.base.json")
		),
		allowJs: false,
		declaration: true,
		emitDeclarationOnly: true,
		noEmitOnError: true,
		baseUrl: "./"
	}

	compiler_options.paths = {
		...compiler_options.paths,
		// overwrite # alias to point to "build/src" instead of "src/"
		"#/*":  ["./.fourtune/v0/build/src/*"],
		"##/*": ["./.fourtune/v0/build/auto/src/*"],
		"&/*":  ["./.fourtune/v0/build/assets/tsmodule/*"],
		"&&/*": ["./.fourtune/v0/build/auto/assets/tsmodule/*"]
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

	const {errors, diagnostic_messages}  = await tsInvokeTypeScript(
		project_root,
		host,
		input_files,
		compiler_options
	)

	if (errors) {
		for (const {message} of diagnostic_messages) {
			fourtune_session.emitError(`tsc`, message)
		}

		return null
	}

	return memfs
}
