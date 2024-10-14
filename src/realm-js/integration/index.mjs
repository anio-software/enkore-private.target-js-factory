import initAsyncSyncProject from "./type/async-sync/init.mjs"
import initPackageLikeProject from "./type/package-like/init.mjs"
import preprocessTypescriptFiles from "./preprocessTypescriptFiles.mjs"
import createTypescriptDefinitionFiles from "./createTypescriptDefinitionFiles.mjs"
import checkSourceFiles from "./checkSourceFiles.mjs"
import initProjectFn from "./initProject.mjs"
import checkProjectFiles from "./checkProjectFiles.mjs"

export async function getIntegrationAPIVersion() {
	return 0
}

//
// this function is called when -init-project was specified on the CLI
//
export async function initProject(fourtune_session, writeFile) {
	await initProjectFn(fourtune_session, writeFile)
}

export async function initializeTarget(fourtune_session) {
	const project_config = fourtune_session.getProjectConfig()

	await checkProjectFiles(fourtune_session)

	switch (project_config.type) {
		case "package": {
			await initPackageLikeProject(fourtune_session)
		} break

		//
		// special kind of package:
		// project/package with only one function that is async+sync
		//
		case "async-sync": {
			await initAsyncSyncProject(fourtune_session)
			await initPackageLikeProject(fourtune_session)
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

	//
	// for every .mts create two files: .mjs and .d.mts
	//
	for (const {relative_path} of fourtune_session.getProjectSourceFiles()) {
		console.log(relative_path)

		if (relative_path.endsWith(".d.mts")) {
			fourtune_session.objects.add(
				relative_path, {
					generator: async () => {
						return ""
					},
					generator_args: []
				}
			)
		} else if (relative_path.endsWith(".mts")) {
			const bare_name = relative_path.slice(0, -4)

			fourtune_session.objects.add(
				`${bare_name}.mjs`, {
					generator: async () => {
						return ""
					},
					generator_args: []
				}
			)

			fourtune_session.objects.add(
				`${bare_name}.d.mts`, {
					generator: async () => {
						return ""
					},
					generator_args: []
				}
			)
		}
	}
}
