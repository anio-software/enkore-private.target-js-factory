import {
	loadRealmDependencies
} from "../auto/base-realm.mjs"

export async function initializeTarget() {
	const {getDependency} = await loadRealmDependencies(
		project_root, "realm-js"
	)

	const rollup = getDependency("rollup")

	console.log("rollup is", rollup)
}
