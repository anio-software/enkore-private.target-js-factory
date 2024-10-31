import path from "node:path"
import fs from "node:fs/promises"
import {getTypeScriptDefinitions} from "./lib/getTypeScriptDefinitions.mjs"
import {initAsyncSyncPackage} from "./lib/init/async-sync/initAsyncSyncPackage.mjs"
import {initPackageProject} from "./lib/init/package-like/initPackageProject.mjs"
import {initializeProjectGeneral} from "./initializeProjectGeneral.mjs"
import {initializeAsyncSyncProject} from "./lib/init/async-sync/initializeAsyncSyncProject.mjs"
import {resolveImportAliases} from "./lib/resolveImportAliases.mjs"

export async function getIntegrationAPIVersion() {
	return 0
}

export async function initializeProject(fourtune_session, writeFile) {
	await initializeProjectGeneral(fourtune_session, writeFile)

	if (fourtune_session.getProjectConfig().type === "package:async/sync") {
		await initializeAsyncSyncProject(fourtune_session, writeFile)
	}
}

async function stripTypes(fourtune_session, code, file_path) {
	const {tsStripTypesFromCode} = await fourtune_session.getDependency(
		"@fourtune/base-realm-js-and-web"
	)

	code = await tsStripTypesFromCode(code, {
		filename: file_path,
		replace_import_extensions: true
	})

	// don't resolve aliases for files located inside assets/ or auto/assets/
	if (file_path.startsWith("assets/") || file_path.startsWith("auto/assets/")) {
		return code
	}

	return await resolveImportAliases(
		fourtune_session, code, file_path
	)
}

async function handleInputFile(fourtune_session, input_file) {
	const absolute_path = path.join(
		fourtune_session.getProjectRoot(), ".fourtune", "v0",
		"build", input_file.source
	)

	if (input_file.name.endsWith(".d.mts")) {
		fourtune_session.objects.addObject(
			input_file.source, async () => {
				let code = (await fs.readFile(
					absolute_path
				)).toString()

				return await resolveImportAliases(
					fourtune_session, code, input_file.source
				)
			}
		)
	} else if (input_file.name.endsWith(".mts")) {
		const extensionless_file_path = input_file.source.slice(0, -4)

		fourtune_session.objects.addObject(
			`${extensionless_file_path}.mjs`, async () => {
				const code = (await fs.readFile(
					absolute_path
				)).toString()

				return await stripTypes(
					fourtune_session, code, input_file.source
				)
			}
		)

		fourtune_session.objects.addObject(
			`${extensionless_file_path}.d.mts`, async (fourtune_session, file_path) => {
				const key = `.fourtune/v0/build/${file_path}`

				if (fourtune_session.user_data.tsc_definitions.has(key)) {
					const code = fourtune_session.user_data.tsc_definitions.get(key)

					return await resolveImportAliases(
						fourtune_session, code, file_path
					)
				}

				return ""
			}
		)
	} else {
		fourtune_session.emitWarning(
			"src.unsupported_file", {
				relative_path: input_file.source
			}
		)
	}
}

export async function preInitialize(
	fourtune_session,
	target_configuration,
	assets,
	source_files
) {
	const project_config = fourtune_session.getProjectConfig()

	if (project_config.type === "package:async/sync") {
		await initAsyncSyncPackage(fourtune_session)
	}
}

export async function initialize(
	fourtune_session,
	target_configuration,
	assets,
	source_files
) {
	const project_config = fourtune_session.getProjectConfig()

	const tsc_src_input_files = []
	const tsc_assets_input_files = []

	//
	// this applies to every realm-js package:
	//
	// - create .d.mts and .mjs file for every .mts file
	// - copy d.mts files as they are
	//
	for (const source_file of source_files) {
		await handleInputFile(fourtune_session, source_file)

		if (source_file.name.endsWith(".mjs")) continue

		tsc_src_input_files.push(source_file.source)
	}

	for (const asset of assets) {
		if (!asset.relative_path.startsWith("tsmodule/")) continue

		await handleInputFile(fourtune_session, asset)

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

	fourtune_session.autogenerate.addFile(
		`cfg/tsconfig.base.json`, function() {
			return JSON.stringify({
				"compilerOptions": {
					"allowImportingTsExtensions": true,
					"allowSyntheticDefaultImports": true,
					"types": ["node"],
					"skipLibCheck": false,
					"strict": true,
					"target": "esnext",
					"module": "nodenext",
					"moduleResolution": "nodenext",
					"isolatedModules": true,
					"baseUrl": "../../"
				}
			}, null, 4) + "\n"
		}
	)

	fourtune_session.autogenerate.addFile(
		`cfg/tsconfig.src.json`, function() {
			return JSON.stringify({
				"extends": "./tsconfig.base.json",
				"compilerOptions": {
					"paths": {
						"#/*": ["./src/*"],
						"##/*": ["./auto/src/*"],
						"&/*": ["./assets/tsmodule/*"],
						"&&/*": ["./auto/assets/tsmodule/*"]
					}
				},
				"include": ["../../src/**/*"]
			}, null, 4) + "\n"
		}
	)

	fourtune_session.autogenerate.addFile(
		`cfg/tsconfig.auto-src.json`, function() {
			return JSON.stringify({
				"extends": "./tsconfig.base.json",
				"compilerOptions": {
					"paths": {
						"#/*": ["./src/*"],
						"##/*": ["./auto/src/*"],
						"&/*": ["./assets/tsmodule/*"],
						"&&/*": ["./auto/assets/tsmodule/*"]
					}
				},
				"include": ["../../auto/src/**/*"]
			}, null, 4) + "\n"
		}
	)

	fourtune_session.autogenerate.addFile(
		`cfg/tsconfig.assets.json`, function() {
			return JSON.stringify({
				"extends": "./tsconfig.base.json",
				"compilerOptions": {
					"paths": {}
				},
				"include": ["../../assets/tsmodule/**/*"]
			}, null, 4) + "\n"
		}
	)

	switch (project_config.type) {
		case "package":
		case "package:async/sync": {
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
				`Unknown target type '${project_config.type}'.`
			)
		}
	}
}
