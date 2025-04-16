import type {EnkoreSessionAPI} from "@enkore/spec"
import {getTargetDependency} from "./getTargetDependency.mts"

export async function embedFileBundler(
	session: EnkoreSessionAPI, entryCode: string
): Promise<string> {
	const {jsBundler} = getTargetDependency(session, "@enkore/rollup")
	const {stripTypeScriptTypes} = getTargetDependency(session, "@enkore/babel")

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
						if (!id.endsWith(".mts")) {
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
