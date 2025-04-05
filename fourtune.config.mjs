import {scandir} from "@aniojs/node-fs"
import path from "node:path"
import {fileURLToPath} from "node:url"

function mapEntry(e) {
	return e.relative_path.slice(0, -("Factory.mts".length))
}

function filterEntry(e) {
	if (e.type !== "regularFile") return false
	if (!e.name.includes("Factory")) return false
	if (!e.name.endsWith(".mts")) return false

	return true
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const apiMethods = (await scandir(
	path.join(__dirname, "src", "targetIntegration", "public"),
	{
		sorted: true,
		filter: filterEntry
	}
)).map(mapEntry)

const runtimeApiMethods = (await scandir(
	path.join(__dirname, "src", "runtime", "public"),
	{
		sorted: true,
		filter: filterEntry
	}
)).map(mapEntry)

export default {
	realm: {
		name: "js",
		type: "package"
	},

	autogenerate: {
		"src/export/targetIntegration/getTargetIntegrationAPIMethodNames.mts": function() {
			return `export function getTargetIntegrationAPIMethodNames() {
	return ${JSON.stringify(apiMethods)}
}\n`
		},

		"src/export/runtime/getRuntimeAPIMethodNames.mts": function() {
			return `export function getRuntimeAPIMethodNames() {
	return ${JSON.stringify(runtimeApiMethods)}
}\n`
		}
	}
}
