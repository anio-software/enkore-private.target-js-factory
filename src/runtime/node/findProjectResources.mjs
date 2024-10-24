import path from "node:path"
import fs from "node:fs/promises"
import readdir from "./util/readdir.mjs"

export default async function(project_root) {
	const resources_path = path.join(project_root, "resources")

	try {
		const stat = await fs.stat(resources_path)

		if (!stat.isDirectory()) {
			throw new Error()
		}
	} catch (error) {
		return []
	}

	const entries = await readdir(resources_path)

	return entries.map(({relative_path}) => {
		if (relative_path.startsWith("tsmodule/")) {
			return {
				type: "tsmodule",
				path: relative_path.slice("tsmodule/".length)
			}
		} else if (relative_path.startsWith("esmodule/")) {
			return {
				type: "esmodule",
				path: relative_path.slice("esmodule/".length)
			}
		} else if (relative_path.startsWith("blob/")) {
			return {
				type: "blob",
				path: relative_path.slice("blob/".length)
			}
		} else if (relative_path.startsWith("text/")) {
			return {
				type: "text",
				path: relative_path.slice("text/".length)
			}
		}

		return false
	}).filter(entry => entry !== false)
}
