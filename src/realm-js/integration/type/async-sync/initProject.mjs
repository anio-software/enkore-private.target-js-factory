function generateImportStatement(what, where, comment = false) {
	return (comment ? "//" : "") + `import {${what}} from "${where}"\n`
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

export default async function(fourtune_session, writeFile) {
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
		dependencies_type_members += `//\t${dependency_function_name}: typeof ${dependency_function_name}Sync,\n`

		factory_imports.push([`${dependency_function_name}Factory`, dependency])
		factory_imports.push([`${dependency_function_name}SyncFactory`, dependency, true])

		dependencies_members += `\t\t${dependency_function_name}: ${dependency_function_name}Factory(user),\n`
		dependencies_members += `//\t\t${dependency_function_name}: ${dependency_function_name}SyncFactory(user),\n`
	}

	if (Object.keys(dependencies).length) {
		dependencies_members += "\t"
	}

	await writeFile(
		`template/auto/DependenciesType.d.mts`,

		fourtune_session.autogenerate.warningComment() +
		generateImportStatements(dependency_type_imports) +
		`export type DependenciesType = {${dependencies_type_members}}\n`,

		{overwrite: true}
	)

	await writeFile(
		`template/auto/${function_name}.mts`,

		fourtune_session.autogenerate.warningComment() +
		`import {${function_name}Factory as factory} from "#/auto/export/${function_name}Factory.mts"\n` +
		`//import {${function_name}SyncFactory as factory} from "#/auto/export/${function_name}SyncFactory.mts"\n` +
		`\n` +
		`/* ImplementationDocType is needed to make doctypes work in LSP */\n` +
		`import type {ImplementationDocType} from "#/auto/export/_implementation.mts"\n` +
		`//import type {ImplementationDocType} from "#/auto/export/_implementationSync.mts"\n` +
		`\n` +
		`const impl = factory()\n` +
		`\n` +
		`export const ${function_name} : ImplementationDocType = impl\n` +
		`//export const ${function_name}Sync : ImplementationDocType = impl\n`,

		{overwrite: true}
	)

	await writeFile(
		`template/auto/${function_name}Factory.mts`,

		fourtune_session.autogenerate.warningComment() +
		`import type {UserContextType} from "@fourtune/realm-js"\n` +
		`import {useContext} from "@fourtune/realm-js"\n` +
		`\n` +
		`import type {DependenciesType} from "#/auto/export/_DependenciesType.d.mts"\n` +
		`//import type {DependenciesType} from "#/auto/export/_DependenciesSyncType.d.mts"\n` +
		`\n` +
		`import implementation from "#/auto/export/_implementation.mts"\n` +
		`//import implementation from "#/auto/export/_implementationSync.mts"\n` +
		`\n` +
		`/* needed to make doctypes work in LSP */\n` +
		`import type {ImplementationDocType} from "#/auto/export/_implementation.mts"\n` +
		`//import type {ImplementationDocType} from "#/auto/export/_implementationSync.mts"\n` +
		`\n` +
		generateImportStatements(factory_imports) +
		`\n` +
		`/* ImplementationDocType is needed to make doctypes work in LSP */\n` +
		`export function ${function_name}Factory(user : UserContextType = {}) : ImplementationDocType {\n` +
		`//export function ${function_name}SyncFactory(user : UserContextType = {}) : ImplementationDocType {\n` +
		`	const context = useContext(user)\n` +
		`\n` +
		`	const dependencies : DependenciesType = {${dependencies_members}}\n` +
		`\n` +
		`	return async function ${function_name}(...args: Parameters<ImplementationDocType>) : ReturnType<ImplementationDocType> {\n` +
		`//	return function ${function_name}Sync(...args: Parameters<ImplementationDocType>) : ReturnType<ImplementationDocType> {\n` +
		`		return await implementation(context, dependencies, ...args)\n` +
		`//		return implementation(context, dependencies, ...args)\n` +
		`	}\n` +
		`}\n`,

		{overwrite: true}
	)

	await writeFile(
		`template/implementation.mts`,

		`import {ContextInstanceType} from "@fourtune/realm-js"\n` +
		`import type {DependenciesType} from "#/auto/export/_DependenciesType.d.mts"\n` +
		`//import type {DependenciesType} from "#/auto/export/_DependenciesSyncType.d.mts"\n` +
		`\n` +
		`/* ############################################## */\n` +
		`/* >>> import your standard dependencies here     */\n` +
		`\n` +
		`/* ############################################## */\n` +
		`\n` +
		`/* ############################################## */\n` +
		`/* >>> define and describe your function api here */\n` +
		`export type ImplementationDocType = {\n` +
		`	/**\n` +
		`	 * @brief My function's description\n` +
		`	 */\n` +
		`	() : Promise<void>\n` +
		`//	() : void\n` +
		`}\n` +
		`/* ############################################## */\n` +
		`\n` +
		`export default async function(\n` +
		`//export default function(\n` +
		`	context : ContextInstanceType,\n` +
		`	dependencies : DependenciesType,\n` +

		`	/* ############################################## */\n` +
		`	/* >>> add additional parameters here             */\n` +
		`\n` +
		`	/* ############################################## */\n` +

		`) : ReturnType<ImplementationDocType> {\n` +
		`// ) : ReturnType<ImplementationDocType> {\n` +
		`\n` +
		`	/* ############################################## */\n` +
		`	/* >>> implement your function here               */\n` +
		`	context.log("hello world")\n` +
		`	/* ############################################## */\n` +
		`\n` +
		`}\n`
	)
}
