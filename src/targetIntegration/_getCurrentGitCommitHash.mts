import {spawnSync} from "node:child_process"

export function _getCurrentGitCommitHash(projectRoot: string): string|false {
	const child = spawnSync("git", [
		"rev-parse",
		"--verify",
		"HEAD"
	], {
		cwd: projectRoot
	})

	if (child.status !== 0) {
		return false
	}

	const output = child.stdout.toString().trim()

	if (output.length !== 40) {
		return false
	}

	return output
}
