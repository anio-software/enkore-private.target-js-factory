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

let runtime_glue_code_fn = `export default function(runtime_var_name) {
\tlet glue_code = ""
`

for (const runtime_method of runtime_methods) {
	runtime_glue_code_fn += `\tglue_code += \``
	runtime_glue_code_fn += `export function ${runtime_method}(...args) { return \${runtime_var_name}.${runtime_method}(...args); }\\n\`\n`
}

runtime_glue_code_fn += `\tglue_code += \`export default \${runtime_var_name};\`\n`
runtime_glue_code_fn += `\treturn glue_code;\n`
runtime_glue_code_fn += `}\n`

await fs.writeFile(
	`./src/runtime/implementation/getRuntimeGlueCode.auto.mjs`, runtime_glue_code_fn
)
