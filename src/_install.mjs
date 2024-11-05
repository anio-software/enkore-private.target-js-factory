import process from "node:process"
import dependencies from "./dependencies.mjs"
import path from "node:path"

async function runInstall() {
	const {default: core} = await import("@fourtune/core")
	const {
		findProjectRootFromDirectory,
		installRealmDependencies
	} = core

	const start_dir = path.dirname(process.argv[1])

	const project_root = await findProjectRootFromDirectory(
		start_dir
	)

	if (project_root === false) {
		throw new Error(
			`Unable to determine project root. Start directory is '${start_dir}'.`
		)
	}

	await installRealmDependencies(project_root, "js", {
		version: 1,
		dependencies
	})
}

// skip installation of realm dependencies in CI/CD environment
// because this package doesn't have the "fourtune" package as a
// dependency
let skip_install = false

if ("ANIO_CICD_REPO" in process.env) {
	skip_install = process.env["ANIO_CICD_REPO"] === "fourtune-org/realm-js"
}

if (skip_install) {
	process.stderr.write(
		`I HAVE SKIPPED THE INSTALLATION SCRIPT SINCE ANIO_CICD_REPO WAS SET!\n`
	)
} else {
	try {
		await runInstall()
	} catch (error) {
		process.stderr.write(
			`An error occurred while installing realm dependencies: ` +
			error.message
		)
		process.exit(1)
	}
}
