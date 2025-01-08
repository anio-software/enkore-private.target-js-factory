import fs from "node:fs/promises"
import path from "node:path"

// todo:
//
// - force private: true to be set
// - don't allow exports key to be set (prohibited field)
// - engines field can be populated automatically? (prohibited field)

export async function _checkProjectPackageJSON(fourtune_session) {
	const package_json = JSON.parse((await fs.readFile(
		path.join(fourtune_session.getProjectRoot(), "package.json")
	)).toString())

	const required_fields = [
		"type",
		"exports"
	]

	for (const field of required_fields) {
		if (!(field in package_json)) {
			fourtune_session.emitError(
				"missingPackageJSONField", {
					field
				}
			)
		}
	}

	const deprecated_fields = [
		"types",
		"typings",
		"main"
	]

	for (const field of deprecated_fields) {
		if (field in package_json) {
			fourtune_session.emitError(
				"deprecatedPackageJSONField", {
					field
				}
			)
		}
	}

	//runtime: "node"|"browser"|"agnostic"
	if ("runtime" in fourtune_session.getRealmOptions()) {
		const {runtime} = fourtune_session.getRealmOptions()

		if (runtime === "node") {
			const types_node = package_json?.peerDependencies?.["@types/node"] ?? "undefined"
			const engines_node = package_json?.engines?.node ?? "undefined"
			const expected_semver = ">=22.7.x"

			if (types_node !== expected_semver) {
				fourtune_session.emitError(
					`invalidOrMissingNodeTypesVersion`, {
						actual: types_node,
						expected: expected_semver
					}
				)
			}

			if (engines_node !== expected_semver) {
				fourtune_session.emitError(
					`invalidOrMissingNodeVersion`, {
						actual: engines_node,
						expected: expected_semver
					}
				)
			}
		}
	}
}
