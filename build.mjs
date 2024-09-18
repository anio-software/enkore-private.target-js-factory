import process from "node:process"
import {fileURLToPath } from "node:url"
import path from "node:path"
import fs from "node:fs/promises"
import writeRealmAutoFiles from "./build/writeRealmAutoFiles.mjs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

process.chdir(__dirname)

let version = null

if (process.argv.length >= 3) {
	version = process.argv[2]

	if (!version.startsWith("v")) {
		throw new Error(`Version must start with "v".`)
	}

	version = version.slice(1)
}

await writeRealmAutoFiles("js", version)

if (!("ANIO_CICD" in process.env)) {
	await fs.rm(`./src/realm-js/package.json`, {force: true})
	await fs.rm(`./src/realm-web/package.json`, {force: true})
}
