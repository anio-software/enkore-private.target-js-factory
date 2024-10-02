import process from "node:process"
import {fileURLToPath } from "node:url"
import path from "node:path"
import fs from "node:fs/promises"
import writeRealmAutoFiles from "./lib/writeRealmAutoFiles.mjs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const project_root = path.join(__dirname, "..")

process.chdir(project_root)

let version = null

if (process.argv.length >= 3) {
	version = process.argv[2]

	if (!version.startsWith("v")) {
		throw new Error(`Version must start with "v".`)
	}

	version = version.slice(1)
}

await writeRealmAutoFiles("js", version)
//await writeRealmAutoFiles("web", version)

if (!("ANIO_CICD" in process.env)) {
	await fs.rm(`./src/realm-js/package.json`, {force: true})
	await fs.rm(`./src/realm-web/package.json`, {force: true})
}
