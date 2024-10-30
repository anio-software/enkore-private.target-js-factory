import path from "node:path"
import process from "node:process"
import dependencies from "./dependencies.mjs"

async function runInstall() {
	const {
		findProjectRootFromDirectory,
		installRealmDependencies
	} = await import("fourtune/base-realm")

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
		...dependencies
	})
}

if (!("ANIO_CICD" in process.env)) {
	await runInstall()
}
