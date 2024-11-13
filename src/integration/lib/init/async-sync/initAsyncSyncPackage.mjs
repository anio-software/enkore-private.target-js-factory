import path from "node:path"

function getTemplateFiles(fourtune_session, function_name) {
	const ret = []

	for (const entry of fourtune_session.input.getSourceFiles()) {
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

export async function initAsyncSyncPackage(fourtune_session) {
	const {generateAsyncSyncVariant} = fourtune_session.autogenerate

	const {target} = fourtune_session.getProjectConfig()
	const targets = Array.isArray(target) ? target : [target]

	for (const target of targets) {
		const {function_name} = target

		const templates = getTemplateFiles(fourtune_session, function_name)

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
}
