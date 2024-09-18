import fs from "node:fs/promises"
import path from "node:path"

export default async function(realm) {
	const entries = await fs.readdir(
		path.join("src", `realm-${realm}`, "auto")
	)

	for (const entry of entries) {
		if (entry === ".gitkeep") continue
		if (entry === "NOTICE.txt") continue

		await fs.rm(
			path.join("src", `realm-${realm}`, "auto", entry), {
				recursive: true,
				force: true
			}
		)
	}
}
