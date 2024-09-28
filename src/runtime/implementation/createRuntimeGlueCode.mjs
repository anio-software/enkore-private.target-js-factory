export default function(runtime_var_name) {
	let glue_code = ""

	let runtime_methods = [
		"getRuntimeVersion",
		"getProjectPackageJSON",
		"loadFourtuneConfiguration",
		"createDefaultContext"
	]

	for (const method of runtime_methods) {
		glue_code += `export function ${method}(...args) { return ${runtime_var_name}.${method}(...args); }\n`
	}

	glue_code += `export default ${runtime_var_name};\n`

	return glue_code
}
