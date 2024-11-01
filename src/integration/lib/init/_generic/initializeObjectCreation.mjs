import path from "node:path"
import {getTypeScriptDefinitions} from "../../getTypeScriptDefinitions.mjs"
import {addObjectFile} from "./addObjectFile.mjs"

export async function initializeObjectCreation(fourtune_session) {
	const source_files = fourtune_session.input.getSourceFiles()
	const assets = fourtune_session.input.getAssetFiles()

	const tsc_src_input_files = []
	const tsc_assets_input_files = []

	for (const source_file of source_files) {
		await addObjectFile(fourtune_session, source_file)

		if (source_file.name.endsWith(".mjs")) continue

		tsc_src_input_files.push(source_file.source)
	}

	for (const asset of assets) {
		if (!asset.relative_path.startsWith("tsmodule/")) continue

		await addObjectFile(fourtune_session, asset)

		tsc_assets_input_files.push(asset.source)
	}

	fourtune_session.hooks.register(
		"createObjectFiles.pre", async () => {
			const toAbsolutePath = (file) => {
				return path.join(
					fourtune_session.getProjectRoot(), ".fourtune", "v0",
					"build", file
				)
			}

			const src_map = await getTypeScriptDefinitions(
				fourtune_session,
				tsc_src_input_files.map(toAbsolutePath),
				false
			)

			const assets_map = await getTypeScriptDefinitions(
				fourtune_session,
				tsc_assets_input_files.map(toAbsolutePath),
				true
			)

			const definitions = new Map([
				...src_map,
				...assets_map
			])

			fourtune_session.user_data.tsc_definitions = definitions
		}
	)
}
