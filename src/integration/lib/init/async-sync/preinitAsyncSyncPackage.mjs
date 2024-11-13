import getFilesToAutogenerate from "./getFilesToAutogenerate.mjs"
import path from "node:path"

function getTemplateFiles(fourtune_session, source_files, function_name) {
	const ret = []

	for (const entry of source_files) {
		if (!(entry.relative_path.startsWith(`template/async.sync/${function_name}/`))) continue

		if (entry.name === "implementationXXX.mts") continue
		if (entry.name === "ImplementationXXXDocType.d.mts") continue

		if (!entry.name.endsWith(".d.mts")) {
			fourtune_session.emitWarning(
				`pkg:async.sync.unsupported_file`, {
					source: entry.source
				}
			)

			continue
		} else if (!(entry.name.includes("XXX"))) {
			fourtune_session.emitWarning(
				`pkg:async.sync.unsupported_file_name`, {
					source: entry.source
				}
			)

			continue
		}

		ret.push(entry)
	}

	return ret
}

export async function preinitAsyncSyncPackage(
	fourtune_session,
	source_files
) {
	const {generateAsyncSyncVariant} = fourtune_session.autogenerate
	const mapping = {}

	const files = await getFilesToAutogenerate(fourtune_session)

	for (const file in files) {
		mapping[file] = [
			"generateAsyncSyncVariantFromString",
			files[file]
		]
	}

	const {target} = fourtune_session.getProjectConfig()
	const targets = Array.isArray(target) ? target : [target]

	for (const target of targets) {
		const {function_name} = target

		mapping[`src/async.sync/${function_name}/Implementation<X>DocType.d.mts`] = [
			"generateAsyncSyncVariant",
			`src/template/async.sync/${function_name}/ImplementationXXXDocType.d.mts`
		]

		mapping[`src/async.sync/${function_name}/implementation<X>.mts`] = [
			"generateAsyncSyncVariant",
			`src/template/async.sync/${function_name}/implementationXXX.mts`
		]

		const templates = getTemplateFiles(
			fourtune_session, source_files, function_name
		)

		for (const template of templates) {
			const {name, source} = template

			const async_file_name = name.split("XXX").join("")
			const sync_file_name = name.split("XXX").join("Sync")

			fourtune_session.autogenerate.addUserFile(
				path.join("src", "export", async_file_name), generateAsyncSyncVariant(source, "async")
			)

			fourtune_session.autogenerate.addUserFile(
				path.join("src", "export", sync_file_name), generateAsyncSyncVariant(source, "sync")
			)
		}
	}

	for (const file_name in mapping) {
		const async_file_name = file_name.split("<X>").join("")
		const sync_file_name = file_name.split("<X>").join("Sync")

		const [generator_fn, source] = mapping[file_name]
		const generator = fourtune_session.autogenerate[generator_fn]

		fourtune_session.autogenerate.addFourtuneFile(
			async_file_name, generator(source, "async")
		)

		fourtune_session.autogenerate.addFourtuneFile(
			sync_file_name, generator(source, "sync")
		)
	}
}
