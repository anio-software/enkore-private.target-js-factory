export default async function(fourtune_session, writeFile) {
	await writeFile(
		`src/template/implementation.mts`,

		`/* -------- required imports by template -------- */\n` +
		`import type {ContextInstanceType} from "@fourtune/realm-js"\n` +
		`import type {DependenciesType} from "##/DependenciesType.d.mts"\n` +
		`//import type {DependenciesType} from "##/DependenciesSyncType.d.mts"\n` +
		`\n` +
		`import type {ImplementationDocType} from "##/ImplementationDocType.d.mts"\n` +
		`//import type {ImplementationDocType} from "##/ImplementationSyncDocType.d.mts"\n` +
		`/* -------- required imports by template -------- */\n` +
		`\n` +
		`\n` +
		`\n` +
		`export default async function(\n` +
		`//export default function(\n` +
		`	context : ContextInstanceType,\n` +
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
		`       /**\n` +
		`        * @brief My function's description\n` +
		`        */\n` +
		`       () : Promise<void>\n` +
		`//     () : void\n` +
		`}\n`
	)
}
