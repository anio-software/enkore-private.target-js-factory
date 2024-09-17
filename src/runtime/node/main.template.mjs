import path from "node:path"
import process from "node:process"

import {findProjectRootFromDirectory} from "<<@BASE_REALM>>"
import rollupPlugin from "<<@ROLLUP_PLUGIN>>"
import {initializeRuntime} from "<<@INITIALIZE_RUNTIME>>"

const start_dir = path.dirname(process.argv[1])

const project_root = await findProjectRootFromDirectory(
	start_dir
)

if (project_root === false) {
	throw new Error(
		`Unable to determine project root. Start directory is '${start_dir}'.`
	)
}

const {ctx} = await rollupPlugin(project_root)
const {runtime_init_data, project_resources} = ctx

const runtime = await initializeRuntime(runtime_init_data, project_resources)

const loadResource_impl = function loadResource(url) {
	return runtime.loadResourceDynamic(url, false)
}

loadResource_impl.asURL = function loadResourceAsURL(url) {
	return runtime.loadResourceDynamic(url, true)
}

export const loadResource = loadResource_impl
