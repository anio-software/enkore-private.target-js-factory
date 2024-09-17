import {rollup} from "rollup"
import rollupNodeResolve from "@rollup/plugin-node-resolve"
import process from "node:process"
import {fileURLToPath } from "node:url"
import path from "node:path"
import createRuntimeGlueCode from "./src/runtime/implementation/createRuntimeGlueCode.mjs"
import fs from "node:fs/promises"
import readJSONFile from "./src/runtime/node/util/readJSONFile.mjs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function createConfigForEntryPoint(entry, additional_plugins) {
	let plugins = [...additional_plugins, rollupNodeResolve()]

	return {
		input: entry,
		output: {
			//file: output,
			format: "es"
		},

		plugins
	}
}

async function processFile(file, additional_plugins = []) {
	const bundle = await rollup(
		createConfigForEntryPoint(file, additional_plugins)
	)

	const {output} = await bundle.generate({})

	return output[0].code
}

process.chdir(__dirname)

async function cleanRealmAutoFiles(realm) {
	const entries = await fs.readdir(
		path.join("src", `realm-${realm}`, "auto")
	)

	for (const entry of entries) {
		if (entry === ".gitkeep") continue

		await fs.rm(
			path.join("src", `realm-${realm}`, "auto", entry), {
				recursive: true,
				force: true
			}
		)
	}
}

async function writeRealmAutoFiles(realm, version) {
	await cleanRealmAutoFiles(realm)

	let node_main_template = (await fs.readFile("./src/runtime/node/main.template.mjs")).toString()

	node_main_template += createRuntimeGlueCode("runtime")

	node_main_template = node_main_template
		.split(`<<@BASE_REALM>>`).join("./base-realm.mjs")
		.split(`<<@ROLLUP_PLUGIN>>`).join("./plugin.mjs")
		.split(`<<@INITIALIZE_RUNTIME>>`).join("./runtime.mjs")

	await fs.writeFile(
		`./src/realm-${realm}/auto/node-main.mjs`, node_main_template
	)

	let install_template = await processFile("./src/runtime/node/install.template.mjs")

	install_template = install_template
		.split(`<<@BASE_REALM>>`).join("./base-realm.mjs")
		.split(`<<REALM>>`).join(realm)

	await fs.writeFile(
		`./src/realm-${realm}/auto/install.mjs`, install_template
	)

	const base_realm_code = await processFile(
		"./node_modules/@fourtune/base-realm/src/index.mjs"
	)

	await fs.writeFile(
		`./src/realm-${realm}/auto/base-realm.mjs`, base_realm_code
	)

	const plugin_code = await processFile(
		"./src/runtime/plugin/main.mjs"
	)

	await fs.writeFile(
		`./src/realm-${realm}/auto/plugin.mjs`, plugin_code
	)

	const runtime_code = await processFile(
		`./src/runtime/implementation/index.mjs`
	)

	await fs.writeFile(
		`./src/realm-js/auto/runtime.mjs`, runtime_code
	)

	let package_json_template = await readJSONFile(
		`./src/realm-${realm}/package.template.json`
	)

	if (ver !== "x.x.x") {
		delete package_json_template.private
	}

	package_json_template.version = version

	await fs.writeFile(
		`./src/realm-${realm}/package.json`, JSON.stringify(package_json_template, null, 2) + "\n"
	)

	await fs.copyFile(
		`./src/runtime/implementation/index.d.ts`, `./src/realm-${realm}/auto/node-main.d.ts`
	)
}

let ver = "x.x.x"

if (process.argv.length >= 3) {
	ver = process.argv[2]

	if (!ver.startsWith("v")) {
		throw new Error(`Version must start with "v".`)
	}

	ver = ver.slice(1)
}

await writeRealmAutoFiles("js", ver)

if (!("ANIO_CICD" in process.env)) {
	await fs.rm(`./src/realm-js/package.json`, {force: true})
}
