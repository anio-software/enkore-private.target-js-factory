import stripTypeScriptTypes from "./fn/stripTypeScriptTypes.mjs"

import path from "node:path"
import fs from "node:fs/promises"

async function copyAsIs(fourtune_session, relative_path, file_path) {
	const project_root = fourtune_session.getProjectRoot()
	const code = (await fs.readFile(
		path.join(project_root, "build", "src", file_path)
	)).toString()

	return code
}

async function stripTypes(fourtune_session, relative_path, file_path) {
	return await stripTypeScriptTypes(fourtune_session, file_path)
}

export default async function(fourtune_session) {
	//
	// for every .mts create two files: .mjs and .d.mts
	//
	for (const {relative_path} of fourtune_session.getProjectSourceFiles()) {
		if (relative_path.endsWith(".d.mts")) {
			fourtune_session.objects.add(
				relative_path, {
					generator: copyAsIs,
					generator_args: [relative_path]
				}
			)
		} else if (relative_path.endsWith(".mts")) {
			const bare_name = relative_path.slice(0, -4)

			fourtune_session.objects.add(
				`${bare_name}.mjs`, {
					generator: stripTypes,
					generator_args: [relative_path]
				}
			)

			fourtune_session.objects.add(
				`${bare_name}.d.mts`, {
					generator: async () => {
						const {dts_definitions} = fourtune_session.user_data

						const key = `build/src/${bare_name}.d.mts`

						if (dts_definitions.has(key)) {
							return dts_definitions.get(key)
						}

						return ""
					},
					generator_args: []
				}
			)
		}
	}
}
