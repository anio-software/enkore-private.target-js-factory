import process from "node:process"
import dependencies from "./dependencies.mjs"

async function runInstall() {
	const {default: core} = await import("@fourtune/core")
	const {installRealmDependencies} = core

	await installRealmDependencies("cli", "js", {
		api_version: 1,
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
			`An error occurred while installing realm dependencies: \n` +
			error.message + "\n"
		)
		process.exit(1)
	}
}
