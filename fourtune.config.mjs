import {scandir} from "@aniojs/node-fs"
import path from "node:path"
import {fileURLToPath} from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const apiFactoryFiles = await scandir(
	path.join(__dirname, "src", "public"),
	{
		sorted: true,
		filter(e) {
			if (e.type !== "regularFile") return false
			if (!e.name.includes("Factory")) return false
			if (!e.name.endsWith(".mts")) return false

			return true
		}
	}
)

const apiMethods = apiFactoryFiles.map(e => {
	return e.name.slice(0, -("Factory.mts".length))
})

export default {
	realm: {
		name: "js",
		type: "package"
	},

	autogenerate: {
		"src/export/getAPIMethodNames.mts": function() {
			return `export function getAPIMethodNames() {
	return ${JSON.stringify(apiMethods)}
}\n`
		}
	}
}
