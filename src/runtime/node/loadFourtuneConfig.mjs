import path from "node:path"

export default async function(project_root) {
	const fourtune_config_path = path.join(project_root, "fourtune.config.mjs")
	const {default: fourtune_config} = await import(fourtune_config_path)
	let resolved_config = fourtune_config

	if (typeof fourtune_config === "function") {
		resolved_config = await fourtune_config()
	}

	return resolved_config
}
