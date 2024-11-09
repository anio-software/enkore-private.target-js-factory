export async function initializeAsyncSyncProject(fourtune_session, writeFile) {
	await writeFile(
		`src/template/implementation.mts`,

		`/* -------- required imports by template -------- */\n` +
		`import type {ContextInstance} from "@fourtune/realm-js/v0/runtime"\n` +
		`import type {DependenciesType} from "#~auto/DependenciesType.d.mts"\n` +
		`//>import type {DependenciesType} from "#~auto/DependenciesSyncType.d.mts"\n` +
		`\n` +
		`import type {ImplementationDocType} from "#~auto/ImplementationDocType.d.mts"\n` +
		`//>import type {ImplementationDocType} from "#~auto/ImplementationSyncDocType.d.mts"\n` +
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
		`src/template/ImplementationDocType.d.mts`,

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
