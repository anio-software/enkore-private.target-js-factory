import {fileURLToPath} from "node:url"
import path from "node:path"
import fs from "node:fs/promises"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const project_root = path.join(__dirname, "..")

process.chdir(project_root)

const runtime_methods = (await fs.readdir(
	"./src/runtime/implementation/methods"
)).filter(file => {
	return file.endsWith(".mjs")
}).map(file => {
	return file.slice(0, -4)
})

runtime_methods.sort((a, b) => {
	return a.localeCompare(b)
})

async function writeGetRuntimeGlueCode() {
	let runtime_glue_code_fn = `export default function(runtime_var_name) {
\tlet glue_code = ""
`

	for (const runtime_method of runtime_methods) {
		//
		// ignore loadResource as its added dynamically
		//
		if (runtime_method === "loadResource") {
			continue
		}

		runtime_glue_code_fn += `\tglue_code += \``
		runtime_glue_code_fn += `export function ${runtime_method}(...args) { return \${runtime_var_name}.${runtime_method}(...args); }\\n\`\n`
	}

	runtime_glue_code_fn += `\tglue_code += \`export default \${runtime_var_name};\`\n`
	runtime_glue_code_fn += `\treturn glue_code;\n`
	runtime_glue_code_fn += `}\n`

	await fs.writeFile(
		`./src/runtime/implementation/getRuntimeGlueCode.auto.mjs`, runtime_glue_code_fn
	)
}

async function writeInitializeRuntime() {
	let initializeRuntime_code = ``

	for (const runtime_method of runtime_methods) {
		//
		// ignore loadResource as its added dynamically
		//
		if (runtime_method === "loadResource") {
			continue
		}

		initializeRuntime_code += `import ${runtime_method} from "./methods/${runtime_method}.mjs"\n`
	}

	initializeRuntime_code += `\n`

	let runtime_public_methods = ``

	for (const runtime_method of runtime_methods) {
		//
		// ignore loadResource as its added dynamically
		//
		if (runtime_method === "loadResource") {
			continue
		}

		runtime_public_methods += `\t\t\t${runtime_method}(...args) {\n`
		runtime_public_methods += `\t\t\t\treturn ${runtime_method}(runtime, ...args)\n`
		runtime_public_methods += `\t\t\t},\n`
	}

	runtime_public_methods = runtime_public_methods.slice(0, -2)

	initializeRuntime_code += `export default function(
	runtime_init_data, project_resources = null
) {
	const runtime = {
		resources: project_resources,
		resources_url: new Map(),

		init_data: runtime_init_data,

		public_interface: {
${runtime_public_methods}
		}
	}

	return runtime.public_interface
}\n`

	await fs.writeFile(
		`./src/runtime/implementation/initializeRuntime.auto.mjs`, initializeRuntime_code
	)
}

function ucfirst(s) {
	return s[0].toUpperCase() + s.slice(1)
}

async function writeRuntimeTypes() {
	let code = ``

	for (const runtime_method of runtime_methods) {
		code += `import type {${ucfirst(runtime_method)}Type} from "./methods/${runtime_method}.d.mts"\n`
	}

	code += `\n`

	for (const runtime_method of runtime_methods) {
		code += `export const ${runtime_method} : ${ucfirst(runtime_method)}Type\n`
	}

	code += `\n`

	code += `declare const _default : {\n`

	for (const runtime_method of runtime_methods) {
		code += `    ${runtime_method}: ${ucfirst(runtime_method)}Type,\n`
	}

	code += `}\n`

	code += `\n`

	code += `export default _default\n`

	await fs.writeFile(
		`./src/runtime/implementation/index.auto.d.ts`, code
	)
}

await writeGetRuntimeGlueCode()
await writeInitializeRuntime()
await writeRuntimeTypes()
