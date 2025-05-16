import fs from "node:fs"
import {fileURLToPath} from "node:url"
import path from "node:path"

if (process.argv.length !== 3) {
	console.log("usage: updatePackageName.mjs <packageName>")
	process.exit(1)
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function patch(filePath, newName) {
	const json = JSON.parse(fs.readFileSync(path.join(__dirname, "..", filePath)))

	json.name = newName

	fs.writeFileSync(path.join(__dirname, "..", filePath), JSON.stringify(json, null, 2))
}

patch("package.json", process.argv[2])
patch("package-lock.json", process.argv[2])
