import determineOutputModules from "./determineOutputModules.mjs"
import generateOutputModule from "./generateOutputModule.mjs"

// export/<name>/<export-name>.mjs
// export/<name>/index.mjs <special>

// no nested folders!
export default async function(fourtune_session) {
	const output_modules = await determineOutputModules(
		fourtune_session
	)

	for (const [output_module, module_exports] of output_modules) {
		await generateOutputModule(
			fourtune_session,
			output_module,
			module_exports
		)
	}
}
