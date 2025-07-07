import {tmpfileSync, writeAtomicFileSync, removeSync} from "@anio-software/pkg.node-fs"
import {spawnSync} from "node:child_process"

type Options = {
	cwd?: string
}

export function _executeNPMWithConfig(
	config: string,
	args: string[],
	options: Options
) {
	const tmpNPMConfigFilePath = tmpfileSync()

	writeAtomicFileSync(tmpNPMConfigFilePath, config, {
		createParents: false,
		mode: 0o600
	})

	try {
		console.log("--------------------")
		console.log(config)
		console.log("--------------------")
		console.log(["npm", ...args, "--userconfig", tmpNPMConfigFilePath])

		return spawnSync(
			"npm", [
				...args,
				"--userconfig",
				tmpNPMConfigFilePath
			], {
				stdio: "pipe",
				cwd: options.cwd
			}
		)
	} finally {
		// config can contain sensitive info, make sure it gets deleted
		removeSync(tmpNPMConfigFilePath)
	}
}
