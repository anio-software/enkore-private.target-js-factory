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

const projectApiMethods = (await scandir(
	path.join(__dirname, "assets", "project", "public"),
	{
		sorted: true,
		filter: filterEntry
	}
)).map(mapEntry)

const autogenerateApiMethods = (await scandir(
	path.join(__dirname, "src", "autogenerate", "public"),
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

		"src/export/project/getProjectAPIMethodNames.mts": function() {
			return `export function getProjectAPIMethodNames() {
	return ${JSON.stringify(projectApiMethods)}
}\n`
		},

		"src/export/autogenerate/getAutogenerateAPIMethodNames.mts": function() {
			return `export function getAutogenerateAPIMethodNames() {
	return ${JSON.stringify(autogenerateApiMethods)}
}\n`
		}
	}
}
