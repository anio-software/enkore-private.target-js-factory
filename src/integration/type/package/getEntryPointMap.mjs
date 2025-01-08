import fs from "node:fs/promises"
import path from "node:path"

function startsWithUpperCaseLetter(fileName) {
	return fileName.slice(0, 1) === fileName.slice(0, 1).toUpperCase()
}

export async function getEntryPointMap(fourtune_session) {
	const entryPointMap = new Map()

	const {
		parseCode,
		getExportsRecursive
	} = fourtune_session.getDependency("@aniojs/node-ts-utils")

	for (const file of fourtune_session.input.getFilteredSourceFiles()) {
		if (!file.parents.length) continue
		if (file.parents[0] !== "export") continue

		const absoluteSource = path.join(
			fourtune_session.getProjectRoot(), file.source
		)

		const entryPointName = file.parents.slice(1).length ? file.parents.slice(1).join("/") : "default"

		if (!entryPointMap.has(entryPointName)) {
			entryPointMap.set(entryPointName, new Map())
		}

		function addNamedExport(exportName, origin, isTypeOnly) {
			const expectedTypeOnly = startsWithUpperCaseLetter(exportName)

			const exportsMap = entryPointMap.get(entryPointName)

			if (exportsMap.has(exportName)) {
				fourtune_session.emit.error(
					undefined, `Entry point "${entryPointName}" already has an export named "${exportName}".`
				)

				return
			}

			if (expectedTypeOnly && !isTypeOnly) {
				fourtune_session.emit.error(
					undefined, `"${origin}" expected the export "${exportName}" to be a type.`
				)

				return
			} else if (!expectedTypeOnly && isTypeOnly) {
				fourtune_session.emit.error(
					undefined, `"${origin}" expected the export "${exportName}" to be a value.`
				)

				return
			}

			exportsMap.set(exportName, {
				origin,
				isTypeOnly
			})
		}

		const expectedExportName = file.name.slice(0, -4)

		const {exports} = getExportsRecursive(
			absoluteSource,
			parseCode(
				(await fs.readFile(absoluteSource)).toString()
			)
		)

		if (exports.length === 0) {
			fourtune_session.emit.error(
				undefined, `"${file.source}" does not export anything.'`
			)

			continue
		}

		// __raw.mts

		//
		// handle files that start with "__" differently
		//
		if (file.name.slice(0, 2) === "__") {
			if (file.name === "__raw.mts") {
				for (const exportDescriptor of exports) {
					// todo: check uppercase => type, lowercase = value

					addNamedExport(
						exportDescriptor.name,
						file.source,
						exportDescriptor.is_type_only
					)
				}
			} else {
				fourtune_session.emit.warning(
					undefined, `"${file.source}" file names starting with __ are reserved for future use.`
				)
			}
		} else {
			if (exports.length > 1) {
				fourtune_session.emit.warning(
					undefined, `"${file.source}" exports more than one thing and is not named "__raw.mts".`
				)
			}

			const actualExport = exports[0]
			const actualExportName = actualExport.name
			const isTypeOnly = actualExport.is_type_only

			if (actualExportName !== expectedExportName) {
				fourtune_session.emit.error(
					undefined, `"${file.source}" export does not match filename: expected "${expectedExportName}", got "${actualExportName}".`
				)

				continue
			}

			addNamedExport(
				actualExportName,
				file.source,
				isTypeOnly
			)
		}
	}

	return entryPointMap
}
