import type {EnkoreSessionAPI} from "@enkore/spec"

export async function embedFileBundler(
	session: EnkoreSessionAPI, entryCode: string
): Promise<string> {
	const {jsBundler} = getTargetDependency(session, "@enkore/target-js-toolchain")
	const {stripTypeScriptTypes} = getTargetDependency(session, "@enkore/target-js-toolchain")

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
