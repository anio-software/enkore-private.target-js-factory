import fs from "node:fs/promises"
import path from "node:path"
import {loadRealmDependencies} from "fourtune/base-realm"
import findProjectResources from "./findProjectResources.mjs"

//
// Generates the project's resources located at <project-root>/resources/<type>/
// where <type> is either "esmodule", "blob" or "text"
//
// Esmodule resources are allowed to import other resources.
// However, they cannot import other esmodule resources.
// Setting the parameter "rollup_plugin" to null makes this function
// not invoke rollup for esmodules.
//
export default async function(project_root, rollup_plugin) {
	const {getDependency} = await loadRealmDependencies(project_root, "realm-js")

	const {jsBundler} = getDependency("@fourtune/base-realm-js-and-web")

	let project_resources = await findProjectResources(project_root)
	let resources = []

	for (const project_resource of project_resources) {
		let contents = ""
		let processed = false

		//
		// ignore esmodules when rollup_plugin is null.
		// this is to only fetch static resources
		// which are guaranteed not to include other
		// resources, as would be the case with esmodule resources
		//
		if (
			project_resource.type === "esmodule" &&
			rollup_plugin !== null
		) {
			const entry_code = (await fs.readFile(
				path.join(
					project_root,
					"resources",
					project_resource.type,
					project_resource.path
				)
			)).toString()

			contents = await jsBundler(
				project_root, entry_code, {
					input_file_type: "mjs",
					treeshake: false,
					additional_plugins: rollup_plugin ? [rollup_plugin] : []
				}
			)

			// set processed flag because contents was processed by rollup
			processed = true
		} else {
			contents = (await fs.readFile(
				path.join(
					project_root,
					"resources",
					project_resource.type,
					project_resource.path
				)
			)).toString()
		}

		resources.push({
			type: project_resource.type,
			path: project_resource.path,
			data: contents,
			processed
		})
	}

	// sort resources for stable output generation
	resources.sort((a, b) => {
		let a_str = `${a.type}:/${a.path}`
		let b_str = `${b.type}:/${b.path}`

		return a_str.localeCompare(b_str, "en")
	})

	return resources
}
