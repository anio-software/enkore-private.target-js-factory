import path from "node:path"
import process from "node:process"
import base_dependencies from "../../base_dependencies.mjs"

import {
	findProjectRootFromDirectory,
	installRealmDependencies
} from "<<@BASE_REALM>>"

const start_dir = path.dirname(process.argv[1])

const project_root = await findProjectRootFromDirectory(
	start_dir
)

if (project_root === false) {
	throw new Error(
		`Unable to determine project root. Start directory is '${start_dir}'.`
	)
}

if (!("ANIO_CICD" in process.env)) {
	await installRealmDependencies(project_root, "realm-<<REALM>>", base_dependencies)
}
