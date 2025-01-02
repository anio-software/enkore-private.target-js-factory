import fs from "node:fs/promises"
import path from "node:path"

function indent(str) {
	let ret = []
	let i = 0

	for (const l of str.split("\n")) {
		if (i === 0) {
			ret.push(`${l}`)
		} else {
			ret.push(`  ${l}`)
		}

		++i
	}

	return ret.join("\n")
}

export async function _orderProjectPackageJSON(fourtune_session) {
	const package_json_path = path.join(fourtune_session.getProjectRoot(), "package.json")

	const package_json = JSON.parse((await fs.readFile(
		package_json_path
	)).toString())

	const all_keys = Object.keys(package_json)

	const key_order = [
		"name",
		"version",
		"author",
		"description",
		"license",
		"exports",
		"repository",
		"type",

		"devDependencies",
		"dependencies",
		"peerDependencies",

		"scripts",

		"engines",
		"files"
	]

	const misc_keys = all_keys.filter(key => !key_order.includes(key))

	let new_package_json = `{\n`

	for (const key of [...key_order, ...misc_keys]) {
		if (!(key in package_json)) continue

		new_package_json += `  "${key}": ${indent(JSON.stringify(package_json[key], null, 2))},\n`
	}

	new_package_json = new_package_json.slice(0, -2)
	new_package_json += `\n}\n`

	await fs.writeFile(
		`${package_json_path}.tmp`,
		new_package_json
	)

	await fs.rename(
		`${package_json_path}.tmp`,
		package_json_path
	)
}
