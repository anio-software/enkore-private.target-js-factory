import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import {getToolchain} from "#~src/getToolchain.ts"

export async function embedFileBundler(
	session: EnkoreSessionAPI, entryCode: string
): Promise<string> {
	const {
		jsBundler,
		stripTypeScriptTypes
	} = getToolchain(session)

	return await jsBundler(
		session.project.root, entryCode, {
			externals: [],
			minify: false,
			treeshake: false,
			additionalPlugins: [{
				when: "pre",
				plugin: {
					name: "enkore-strip-types",
					async transform(code, id) {
						if (!id.endsWith(".ts")) {
							return null
						}

						return stripTypeScriptTypes(code, {
							rewriteImportExtensions: false,
							filePath: id
						})
					}
				}
			}]
		}
	)
}
