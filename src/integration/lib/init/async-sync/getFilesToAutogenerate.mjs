function generateImportStatement(what, where, comment = false) {
	return (comment ? "//>" : "") + `import {${what}} from "${where}"\n`
}

function generateImportStatements(statements) {
	let ret = ``

	for (const statement of statements) {
		const [what, where] = statement
		const comment = statement.length === 3 ? statement[2] : false

		ret += generateImportStatement(what, where, comment)
	}

	return ret
}

export default async function(fourtune_session) {
	let files = {}

	const {target} = fourtune_session.getProjectConfig()
	const {function_name} = target
	let dependencies = []

	if ("dependencies" in target) {
		dependencies = target.dependencies
	}

	let dependency_type_imports = []
	let factory_imports = []

	let dependencies_type_members = ``
	let dependencies_members = ``

	if (Object.keys(dependencies).length) {
		dependencies_type_members += "\n"
		dependencies_members += "\n"
	}

	for (const dependency in dependencies) {
		const dependency_function_name = dependencies[dependency]

		dependency_type_imports.push([`${dependency_function_name}`, dependency])
		dependency_type_imports.push([`${dependency_function_name}Sync`, dependency, true])

		dependencies_type_members += `\t${dependency_function_name}: typeof ${dependency_function_name},\n`
		dependencies_type_members += `//>\t${dependency_function_name}: typeof ${dependency_function_name}Sync,\n`

		factory_imports.push([`${dependency_function_name}Factory`, dependency])
		factory_imports.push([`${dependency_function_name}SyncFactory`, dependency, true])

		dependencies_members += `\t\t${dependency_function_name}: ${dependency_function_name}Factory(user),\n`
		dependencies_members += `//>\t\t${dependency_function_name}: ${dependency_function_name}SyncFactory(user),\n`
	}

	if (Object.keys(dependencies).length) {
		dependencies_members += "\t"
	}

	files[`src/Dependencies<X>Type.d.mts`] =
		generateImportStatements(dependency_type_imports) +
		`export type DependenciesType = {${dependencies_type_members}}\n`

	files[`src/export/${function_name}<X>.mts`] =
		`import {${function_name}Factory as factory} from "#~auto/export/${function_name}Factory.mts"\n` +
		`//>import {${function_name}SyncFactory as factory} from "#~auto/export/${function_name}SyncFactory.mts"\n` +
		`\n` +
		`/* ImplementationDocType is needed to make doctypes work in LSP */\n` +
		`import type {ImplementationDocType} from "#~auto/ImplementationDocType.d.mts"\n` +
		`//>import type {ImplementationDocType} from "#~auto/ImplementationSyncDocType.d.mts"\n` +
		`\n` +
		`const impl = factory()\n` +
		`\n` +
		`export const ${function_name} : ImplementationDocType = impl\n` +
		`//>export const ${function_name}Sync : ImplementationDocType = impl\n`

	files[`src/export/${function_name}<X>Factory.mts`] =
		`import {\n` +
		`	getProjectPackageJSON,\n` +
		`	getFourtuneConfiguration\n` +
		`} from "@fourtune/realm-js/v0/project"\n` +
		`\n` +
		`import type {UserContext} from "@fourtune/realm-js/v0/runtime"\n` +
		`import {useContext} from "@fourtune/realm-js/v0/runtime"\n` +
		`\n` +
		`import type {DependenciesType} from "#~auto/DependenciesType.d.mts"\n` +
		`//>import type {DependenciesType} from "#~auto/DependenciesSyncType.d.mts"\n` +
		`\n` +
		`import implementation from "#~auto/implementation.mts"\n` +
		`//>import implementation from "#~auto/implementationSync.mts"\n` +
		`\n` +
		`/* needed to make doctypes work in LSP */\n` +
		`import type {ImplementationDocType} from "#~auto/ImplementationDocType.d.mts"\n` +
		`//>import type {ImplementationDocType} from "#~auto/ImplementationSyncDocType.d.mts"\n` +
		`\n` +
		generateImportStatements(factory_imports) +
		`\n` +
		`/* ImplementationDocType is needed to make doctypes work in LSP */\n` +
		`export function ${function_name}Factory(user : UserContext = {}) : ImplementationDocType {\n` +
		`//>export function ${function_name}SyncFactory(user : UserContext = {}) : ImplementationDocType {\n` +
		`	const project = {\n` +
		`		package_json: getProjectPackageJSON(),\n` +
		`		fourtune_configuration: getFourtuneConfiguration()\n` +
		`	}\n` +
		`\n` +
		`	const context = useContext(project, user)\n` +
		`\n` +
		`	const dependencies : DependenciesType = {${dependencies_members}}\n` +
		`\n` +
		`	return async function ${function_name}(...args: Parameters<ImplementationDocType>) : ReturnType<ImplementationDocType> {\n` +
		`//>	return function ${function_name}Sync(...args: Parameters<ImplementationDocType>) : ReturnType<ImplementationDocType> {\n` +
		`		return await implementation(context, dependencies, ...args)\n` +
		`//>		return implementation(context, dependencies, ...args)\n` +
		`	}\n` +
		`}\n`

	return files
}
