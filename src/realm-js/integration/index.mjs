import {
	loadRealmDependencies
} from "../auto/base-realm.mjs"

import rollupPlugin from "./rollupPlugin.mjs"

export async function getIntegrationAPIVersion() {
	return 0
}

export async function initializeTarget(project_root) {
	const {getDependency} = await loadRealmDependencies(
		project_root, "realm-js"
	)

	const rollup = getDependency("rollup")

	console.log("rollup is", rollup)
	console.log(
		"rollup plugin is", rollupPlugin()
	)
}
