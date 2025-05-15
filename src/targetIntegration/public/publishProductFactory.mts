import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import {spawnSync} from "node:child_process"

const impl: API["publishProduct"] = async function(
	this: APIContext, session, productName
) {
	session.enkore.emitMessage("info", `publishing '${productName}'`)

	const child = spawnSync("npm", [
		"publish",
		"--provenance",
		"--access",
		"public"
	], {
		cwd: ".",
		stdio: "pipe"
	})

	console.log("child status", child.status)

	if (child.status !== 0) {
		console.log("child stdout", child.stdout.toString())
		console.log("child stderr", child.stderr.toString())

		session.enkore.emitMessage("error", "failed to publish package via npm.")
	}
}

export function publishProductFactory(context: APIContext) {
	return impl!.bind(context)
}
