import type {API} from "#~src/targetIntegration/API.ts"
import type {APIContext} from "#~src/targetIntegration/APIContext.ts"
import {createEntity} from "@anio-software/enkore-private.spec"
import {scandir} from "@anio-software/pkg.node-fs"
import path from "node:path"
import {
	isAsyncSyncExpandableFilePath,
	expandAsyncSyncVariantFilePath,
	expandAsyncSyncVariantSourceFile
} from "@anio-software/enkore-private.target-js-utils"

const impl: API["hook"]["preInitialize"] = async function(
	this: APIContext, session
) {
	const allProjectFiles = [
		...await scan("src"),
		...await scan("export")
	]

	for (const file of allProjectFiles) {
		const isAsyncSyncVariantTemplateFile = isAsyncSyncExpandableFilePath(
			file.source
		)

		if (!isAsyncSyncVariantTemplateFile) continue

		const [asyncPath, syncPath] = expandAsyncSyncVariantFilePath(
			file.source
		)

		session.addAutogeneratedFile(
			createEntity(
				"EnkoreAutogeneratedFile", 0, 0, {
					destinationPath: asyncPath,
					generator() {
						return expandAsyncSyncVariantSourceFile(
							file.absolutePath, "async"
						)
					}
				}
			)
		)

		session.addAutogeneratedFile(
			createEntity(
				"EnkoreAutogeneratedFile", 0, 0, {
					destinationPath: syncPath,
					generator() {
						return expandAsyncSyncVariantSourceFile(
							file.absolutePath, "sync"
						)
					}
				}
			)
		)
	}

	async function scan(dir: string) {
		return (
			await scandir(path.join(
				session.project.root, "project", dir
			), {
				allowMissingDir: true
			})
		).map(entry => {
			return {
				absolutePath: entry.absolutePath,
				source: path.join("project", dir, entry.relativePath)
			}
		})
	}
}

export function preInitializeFactory(context: APIContext) {
	return impl!.bind(context)
}
