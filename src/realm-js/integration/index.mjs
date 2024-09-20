import initLibraryProject from "./type/library/init.mjs"
import initPackageProject from "./type/package/init.mjs"
import buildSourceFile from "./fn/builder/sourceFile.mjs"

export async function getIntegrationAPIVersion() {
	return 0
}

export async function initializeTarget(fourtune_session) {
	const project_config = fourtune_session.getProjectConfig()

	switch (project_config.type) {
		case "package": {
			await initPackageProject(fourtune_session)

			// provide source as javascript module
			fourtune_session.distributables.addFile(`source.mjs`, {generator: buildSourceFile, generator_args: ["package.mjs"]})
			fourtune_session.distributables.addFile(`source.min.mjs`, {generator: buildSourceFile, generator_args: ["package.min.mjs"]})
		} break

		case "library": {
			await initLibraryProject(fourtune_session)

			// provide source as javascript module
			//fourtune_session.distributables.addFile(`source.mjs`, {generator: buildSourceFile, generator_args: ["library.mjs"]})
			//fourtune_session.distributables.addFile(`source.min.mjs`, {generator: buildSourceFile, generator_args: ["library.min.mjs"]})
		} break

		/*
		case "app": {
			//await initAppProject(context)
		} break

		case "class": {
			//await initClassProject(context)
		} break
		*/

		default: {
			throw new Error(
				`Unknown target type '${project_config.type}'.`
			)
		}
	}
}
