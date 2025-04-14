import type {EnkoreSessionAPI} from "@enkore/spec"
import {getTargetDependency} from "./getTargetDependency.mts"

export async function embedFileBundler(
	session: EnkoreSessionAPI, entryCode: string
): Promise<string> {
	const {jsBundler} = getTargetDependency(session, "@enkore/rollup")
	const {
		createSourceFileFromCode,
		stripTypes
	} = getTargetDependency(session, "@enkore/typescript")

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

						return stripTypes(
							createSourceFileFromCode(code, {
								filePath: id
							}),
							false
						)
					}
				}
			}]
		}
	)
}
