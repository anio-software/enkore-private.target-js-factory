import path from "node:path"
import process from "node:process"
import base_dependencies from "./base_dependencies.mjs"

import {
	findProjectRootFromDirectory,
	installRealmDependencies
} from "<<@BASE_REALM>>"

async function runInstall(do_nothing = true, additional_dependencies = {}) {
	if (do_nothing) return

	const start_dir = path.dirname(process.argv[1])

	const project_root = await findProjectRootFromDirectory(
		start_dir
	)

	if (project_root === false) {
		throw new Error(
			`Unable to determine project root. Start directory is '${start_dir}'.`
		)
	}

	await installRealmDependencies(project_root, "realm-<<REALM>>", {
		...base_dependencies,
		...additional_dependencies
	})
}

/* just here so rollup keeps the function :) */
await runInstall(true, {})
