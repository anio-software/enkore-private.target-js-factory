export async function initializeAsyncSyncProject(fourtune_session, writeFile) {
	const {target} = fourtune_session.getProjectConfig()
	const targets = Array.isArray(target) ? target : [target]

	for (const target of targets) {
		const {function_name} = target

		const import_base_path = `#~auto/fourtune/async.sync/${function_name}`

		await writeFile(
			`src/template/async.sync/${function_name}/implementation.mts`,

			`/* -------- required imports by template -------- */\n` +
			`import type {ContextInstance} from "@fourtune/realm-js/v0/runtime"\n` +
			`import type {DependenciesType} from "${import_base_path}/DependenciesType.d.mts"\n` +
			`//>import type {DependenciesType} from "${import_base_path}/DependenciesSyncType.d.mts"\n` +
			`\n` +
			`import type {ImplementationDocType} from "#~auto/fourtune/async.sync/${function_name}/ImplementationDocType.d.mts"\n` +
			`//>import type {ImplementationDocType} from "#~auto/fourtune/async.sync/${function_name}/ImplementationSyncDocType.d.mts"\n` +
			`/* -------- required imports by template -------- */\n` +
			`\n` +
			`\n` +
			`\n` +
			`export default async function(\n` +
			`//>export default function(\n` +
			`	context : ContextInstance,\n` +
			`	dependencies : DependenciesType,\n` +
			`	/* add additional parameters here */\n` +
			`) : ReturnType<ImplementationDocType> {\n` +
			`\n` +
			`	void context;\n` +
			`	void dependencies;\n` +
			`\n` +
			`}\n`
		)

		await writeFile(
			`src/template/async.sync/${function_name}/ImplementationDocType.d.mts`,

			`/* define and describe your function api here */\n` +
			`export type ImplementationDocType = {\n` +
			`\t/**\n` +
			`\t * @brief My function's description\n` +
			`\t */\n` +
			`\t() : Promise<void>\n` +
			`//>\t() : void\n` +
			`}\n`
		)
	}
}
