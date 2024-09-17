import fs from "node:fs/promises"
import path from "node:path"

async function readdirInner(root_dir, dir_entry, context) {
	const entries = await fs.readdir(
		path.join(root_dir, dir_entry)
	)

	for (const entry of entries) {
		const relative_path = path.join(dir_entry, entry)
		const absolute_path = path.join(root_dir, relative_path)
		const stat = await fs.lstat(absolute_path)

		if (stat.isDirectory()) {
			await readdirInner(
				root_dir, relative_path, context
			)
		} else {
			context.push({relative_path, absolute_path})
		}
	}
}

export default async function(dir) {
	let context = []
	const absolute_path = await fs.realpath(dir)

	await readdirInner(absolute_path, ".", context)

	return context
}
