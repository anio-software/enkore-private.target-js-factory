export default function(runtime_var_name) {
	let glue_code = ""
	glue_code += `export function createDefaultContext(...args) { return ${runtime_var_name}.createDefaultContext(...args); }\n`
	glue_code += `export function getProjectPackageJSON(...args) { return ${runtime_var_name}.getProjectPackageJSON(...args); }\n`
	glue_code += `export function getRuntimeVersion(...args) { return ${runtime_var_name}.getRuntimeVersion(...args); }\n`
	glue_code += `export function loadFourtuneConfiguration(...args) { return ${runtime_var_name}.loadFourtuneConfiguration(...args); }\n`
	glue_code += `export function loadResourceDynamic(...args) { return ${runtime_var_name}.loadResourceDynamic(...args); }\n`
	glue_code += `export function useContext(...args) { return ${runtime_var_name}.useContext(...args); }\n`
	glue_code += `export default ${runtime_var_name};`
	return glue_code;
}
