import {expandAsyncSyncVariantName} from "../../expandAsyncSyncVariantName.mjs"
import {_generateFactoryCode} from "./_generateFactoryCode.mjs"
import {_generateFunctionCode} from "./_generateFunctionCode.mjs"
import fs from "node:fs/promises"
import path from "node:path"

/*
input object:

	source_file: "src/bla.mts",
	export_name: "blaBla",
	destination: "src/export/"
*/
export function generateFactoryFiles(
	options
) {
	const required_options = ["source_file", "export_name", "destination"]

	for (const o of required_options) {
		if (!(o in options)) {
			throw new Error(`Required option '${o}' not set.`)
		}
	}

	let ret = {}

	if (!options.source_file.startsWith("src/")) {
		throw new Error(`source file must be inside src/.`)
	} else if (!options.destination.startsWith("src/")) {
		throw new Error(`destination must start with src/.`)
	}

	const base = `${options.destination}/${options.export_name}`
	const base_without_src = `${options.destination.slice(4)}/${options.export_name}`

	if (options.source_file.endsWith(".as.mts")) {
		const [async_path, sync_path] = expandAsyncSyncVariantName(options.source_file.slice(4))

		ret[`${base}.mts`] = async function(fourtune_session) {
			return _generateFunctionCode(
				`#~auto/${base_without_src}Factory.mts`,
				`${options.export_name}Factory`,
				`#~auto/${async_path}.mts`,
				options.export_name
			)
		}

		ret[`${base}Sync.mts`] = async function(fourtune_session) {
			return _generateFunctionCode(
				`#~auto/${base_without_src}SyncFactory.mts`,
				`${options.export_name}SyncFactory`,
				`#~auto/${sync_path}.mts`,
				`${options.export_name}Sync`
			)
		}

		ret[`${base}Factory.mts`] = async function(fourtune_session) {
			const {generateAsyncSyncVariant} = fourtune_session.autogenerate

			// NB: we must create our own version of async/sync
			// since we would be potentially using outdated code
			// (e.g. if we read the code from the file system (auto/src/ folder))
			const generate = await generateAsyncSyncVariant(
				options.source_file, "async"
			)

			const source = await generate(fourtune_session)
			const base_object = await fourtune_session.getDependency("@fourtune/base-realm-js-and-web")
			const {tsGetDeclaredAnioSoftwareDependenciesFromCode} = base_object
			const dependencies = await tsGetDeclaredAnioSoftwareDependenciesFromCode(source)

			return _generateFactoryCode(
				`#~auto/${async_path}.mts`,
				"implementation",
				`${options.export_name}Factory`,
				dependencies,
				true
			)
		}

		ret[`${base}SyncFactory.mts`] = async function(fourtune_session) {
			const {generateAsyncSyncVariant} = fourtune_session.autogenerate

			// NB: we must create our own version of async/sync
			// since we would be potentially using outdated code
			// (e.g. if we read the code from the file system (auto/src/ folder))
			const generate = await generateAsyncSyncVariant(
				options.source_file, "sync"
			)

			const source = await generate(fourtune_session)
			const base_object = await fourtune_session.getDependency("@fourtune/base-realm-js-and-web")
			const {tsGetDeclaredAnioSoftwareDependenciesFromCode} = base_object
			const dependencies = await tsGetDeclaredAnioSoftwareDependenciesFromCode(source)

			return _generateFactoryCode(
				`#~auto/${sync_path}.mts`,
				"implementationSync",
				`${options.export_name}SyncFactory`,
				dependencies,
				false
			)
		}

		return ret
	}

	ret[`${base}.mts`] = async function(fourtune_session) {
		return _generateFunctionCode(
			`#~auto/${base_without_src}Factory.mts`,
			`${options.export_name}Factory`,
			`#~${options.source_file}`,
			"implementation"
		)
	}

	ret[`${base}Factory.mts`] = async function(fourtune_session) {
		const source = (await fs.readFile(
			path.join(fourtune_session.getProjectRoot(), options.source_file)
		)).toString()

		const base_object = await fourtune_session.getDependency("@fourtune/base-realm-js-and-web")
		const {
			tsGetDeclaredAnioSoftwareDependenciesFromCode,
			tsGetExportedFunctionFromCode
		} = base_object

		const dependencies = await tsGetDeclaredAnioSoftwareDependenciesFromCode(source)
		const {is_async} = await tsGetExportedFunctionFromCode(source, "implementation")

		return _generateFactoryCode(
			`#~${options.source_file}`,
			"implementation",
			`${options.export_name}Factory`,
			dependencies,
			is_async
		)
	}

	return ret
}
