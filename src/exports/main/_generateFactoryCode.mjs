import path from "node:path"

function convertAndSortDependencies(dependencies) {
	let ret = []

	for (const [prop_name, origin] of dependencies.entries()) {
		ret.push({
			prop_name,
			origin
		})
	}

	ret.sort((a, b) => {
		return a.prop_name.localeCompare(b.prop_name)
	})

	return ret
}

export function _generateFactoryCode(
	source_path,
	import_name,
	export_name,
	dependencies,
	is_async
) {
	dependencies = convertAndSortDependencies(dependencies)

	const src = JSON.stringify(path.normalize(source_path))

	let dependencies_import = "", dependencies_init = ""

	for (const dependency of dependencies) {
		dependencies_import += `import {${dependency.origin.export_name}Factory} from "${dependency.origin.module_name}"\n`

		dependencies_init += `\t\t${dependency.prop_name}: ${dependency.origin.export_name}Factory(user),\n`
	}

	// remove trailing new line and comma
	if (dependencies_init.length) {
		dependencies_init = dependencies_init.slice(0, -2)
	}

	if (dependencies_import.length) {
		dependencies_import = `\n${dependencies_import}`
	}

	if (dependencies_init.length) {
		dependencies_init = `\n${dependencies_init}\n\t`
	}

	return `
import {${import_name} as implementation} from ${src}
import type {Dependencies, Signature} from ${src}
import type {UserContext} from "@fourtune/realm-js/v0/runtime"
import {getProject} from "@fourtune/realm-js/v0/project"
import {useContext} from "@fourtune/realm-js/v0/runtime"
${dependencies_import}
export function ${export_name}(user: UserContext = {}) : Signature {
	const project = getProject()
	const context = useContext(project, user)

	const dependencies : Dependencies = {${dependencies_init}}

	return ${is_async ? "async " : ""}function(...args: Parameters<Signature>) : ReturnType<Signature> {
		return ${is_async ? "await ": ""}implementation(context, dependencies, ...args)
	}
}
`.slice(1)

}
