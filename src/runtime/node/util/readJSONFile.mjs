import fs from "node:fs/promises"

export default async function(path) {
	return JSON.parse((await fs.readFile(path)).toString())
}
