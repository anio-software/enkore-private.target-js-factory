import fs from "node:fs/promises"
import path from "node:path"

export default async function(fourtune_session) {
	const project_root = fourtune_session.getProjectRoot()

	const package_json_data = await fs.readFile(
		path.join(project_root, "package.json")
	)

	const package_json = JSON.parse(package_json_data)

	if (!("type" in package_json)) {
		fourtune_session.addWarning(
			`package.json.missingType`, `"type" is missing package.json.`
		)
	} else if (package_json.type !== "module") {
		fourtune_session.addWarning(
			`package.json.typeNotModule`, `"type" is not set to "module".`
		)
	}

	if (("typings" in package_json) || ("types" in package_json)) {
		fourtune_session.addWarning(
			`package.json.deprecatedField`, `package.json contains deprecated field "types" or "typings".`
		)
	}

	if ("main" in package_json) {
		fourtune_session.addWarning(
			`package.json.deprecatedField`, `package.json contains deprecated field "main".`
		)
	}
}
