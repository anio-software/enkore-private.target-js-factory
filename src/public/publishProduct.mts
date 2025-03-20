import type {API} from "#~src/API.d.mts"
import {spawnSync} from "node:child_process"

const impl: API["publishProduct"] = async function(
	session, productName
) {
	session.enkore.emitMessage("info", `publishing '${productName}'`)

	const child = spawnSync("npm", [
		"publish",
		"--access",
		"public"
	], {
		cwd: ".",
		stdio: "pipe"
	})

	console.log("cstatus", child.status)

	if (child.status !== 0) {
		session.enkore.emitMessage("error", "failed to publish package via npm.")
	}
}

export const publishProduct = impl
