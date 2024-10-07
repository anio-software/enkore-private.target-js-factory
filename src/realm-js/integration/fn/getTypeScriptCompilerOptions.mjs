import {loadRealmDependencies} from "../../auto/base-realm.mjs"

export default async function(fourtune_session) {
	const {
		getDependency,
		getPathOfDependency
	} = await loadRealmDependencies(
		fourtune_session.getProjectRoot(), "realm-js"
	)

	const ts = getDependency("typescript")

	return {
		skipLibCheck: false,

		noEmit: true,
		strict: true,

		target: ts.ScriptTarget.ESNext,

		module: ts.ModuleKind.NodeNext,
		moduleResolution: ts.ModuleResolutionKind.NodeNext,

		types: [
			getPathOfDependency("@types/node")
		]
	}
}
