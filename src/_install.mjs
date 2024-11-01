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

	await installRealmDependencies(project_root, "realm-js", {
		...dependencies
	})
}

// skip installation of realm dependencies in CI/CD environment
// because this package doesn't have the "fourtune" package as a
// dependency
let skip_install = false

if ("ANIO_CICD_REPO" in process.env) {
	skip_install = process.env["ANIO_CICD_REPO"] === "fourtune-org/realm-js"
}

if (!skip_install) {
	await runInstall()
}
