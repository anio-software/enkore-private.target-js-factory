import createRuntimeGlueCode from "../implementation/createRuntimeGlueCode.mjs"

export default async function(ctx, use_static_runtime) {
	const {
		runtime_init_data,
		project_resources
	} = ctx

	let virtual_module = ``

	virtual_module  = `const runtime_init_data = ` + JSON.stringify(runtime_init_data, null, 4) + ";\n"
	virtual_module += `import {initializeRuntime} from "@fourtune/js-runtime"\n`
	virtual_module += `const runtime = initializeRuntime(runtime_init_data);\n`

	const load_resources_fn_name = "loadResource"
	//use_static_runtime ? "loadStaticResource" : "loadResource"

	//
	// this is implemented this way to allow loadResource/loadStaticResource
	// to be tree shaked (i.e. removing resources from output file)
	//
	virtual_module += `
const ${load_resources_fn_name}_impl = function ${load_resources_fn_name}(url) {
	if (runtime.resources === null) {
		runtime.resources = ${JSON.stringify(project_resources)};
	}

	// defer to the dynamic runtime to load the resource
	return runtime.loadResourceDynamic(url, false)
}

${load_resources_fn_name}_impl.asURL = function ${load_resources_fn_name}AsURL(url) {
	// make sure resources are loaded
	${load_resources_fn_name}_impl(null);

	return runtime.loadResourceDynamic(url, true)
}

export const ${load_resources_fn_name} = ${load_resources_fn_name}_impl;
`

	virtual_module += createRuntimeGlueCode("runtime")

	return virtual_module
}
