import {isExpandableFilePath} from "@fourtune/js-and-web-runtime-and-rollup-plugins/v0/utils-api"

import {initializeProjectGeneric} from "./init/initializeProjectGeneric.mjs"
import {preInitializeGeneric} from "./init/preinitializeGeneric.mjs"
import {initializeGeneric} from "./init/initializeGeneric.mjs"

import {initPackageProject} from "./lib/init/package-like/initPackageProject.mjs"

export async function getIntegrationAPIVersion() {
	return 0
}

/**
 * This function is called by 'fourtune' to filter
 * out source files.
 *
 * The filtered source files will be available at
 * fourtuneSession.input.getFilteredSourceFiles().
 */
export async function inputSourceFileFilter(file) {
	//
	// We only accept .mts files. However, this does not
	// include .d.mts files.
	//
	if (!file.source.endsWith(".mts")) {
		return false
	} else if (file.source.endsWith(".d.mts")) {
		return false
	}

	// Ignore async/sync variant files (ends with ".as.mts")
	// These are handled separately in preInitialize()
	if (isExpandableFilePath(file.name)) return null

	return true
}

export async function initializeProject(fourtune_session, writeFile) {
	await initializeProjectGeneric(fourtune_session, writeFile)
}

export async function preInitialize(
	fourtune_session,
	target_configuration,
	assets,
	source_files
) {
	const project_config = fourtune_session.getProjectConfig()

	await preInitializeGeneric(fourtune_session, source_files)
}

export async function initialize(
	fourtune_session,
	target_configuration,
	assets,
	source_files
) {
	const project_config = fourtune_session.getProjectConfig()

	await initializeGeneric(fourtune_session)

	switch (project_config.realm.type) {
		case "package": {
			await initPackageProject(fourtune_session)
		} break

//		case "app": {
//			await initAppProject(context)
//		} break

//		case "class": {
//			await initClassProject(context)
//		} break

		default: {
			throw new Error(
				`Unknown target type '${project_config.realm.type}'.`
			)
		}
	}
}
