import initPackageProject from "./type/package/init.mjs"

export async function getIntegrationAPIVersion() {
	return 0
}

export async function initializeTarget(fourtune_session) {
	const project_config = fourtune_session.getProjectConfig()

	switch (project_config.type) {
		case "package": {
			await initPackageProject(fourtune_session)
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
