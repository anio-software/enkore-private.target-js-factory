import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import {_productNameToNPMPackage} from "../_productNameToNPMPackage.mts"
import {_generateNPMConfig} from "../_generateNPMConfig.mts"
import {spawnSync} from "node:child_process"
import {tmpfileSync, writeAtomicFileSync, removeSync} from "@aniojs/node-fs"

const impl: API["publishProduct"] = async function(
	this: APIContext, session, productName
) {
	const [
		_,
		npmPackage
	] = _productNameToNPMPackage(session, productName)

	session.enkore.emitMessage("info", `publishing '${productName}' (${npmPackage.name})`)

	const npmPublishArgs: string[] = [
		"publish"
	]

	if (npmPackage.publishWithProvenance === true) {
		npmPublishArgs.push("--provenance")
	}

	npmPublishArgs.push("--access")
	npmPublishArgs.push("public")

	const targetOptions = session.target.getOptions(this.target)

	const npmBinaryPath = targetOptions.npm?.binaryPath ?? "npm"
	let tmpConfigFilePath: string|null = null

	if (targetOptions.npm?.registry) {
		tmpConfigFilePath = tmpfileSync()

		const npmConfig = _generateNPMConfig(
			session.project.root,
			targetOptions.npm.registry
		)

		writeAtomicFileSync(tmpConfigFilePath, npmConfig, {
			createParents: false,
			mode: 0o600
		})

		npmPublishArgs.push("--userconfig")
		npmPublishArgs.push(tmpConfigFilePath)

		console.log("contents of npmrc")
		console.log("--------------------------------")
		console.log(npmConfig)
		console.log("--------------------------------")
	}

	console.log("npm publish args", npmPublishArgs)

	try {
		const child = spawnSync(npmBinaryPath, npmPublishArgs, {
			cwd: ".",
			stdio: "pipe"
		})

		console.log("child status", child.status)

		if (child.status !== 0) {
			console.log("child stdout", child.stdout.toString())
			console.log("child stderr", child.stderr.toString())

			session.enkore.emitMessage("error", "failed to publish package via npm.")
		}
	} finally {
		// config file can contain sensitive data such as the auth token
		if (tmpConfigFilePath !== null) {
			removeSync(tmpConfigFilePath)
		}
	}
}

export function publishProductFactory(context: APIContext) {
	return impl!.bind(context)
}
