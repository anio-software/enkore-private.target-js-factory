import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import path from "node:path"
import type {MyTSSourceFileTransformer} from "@enkore-types/target-js-toolchain"

const impl: API["preprocess"] = async function(
	this: APIContext, session, file, sourceCode
) {
	if (!file.fileName.endsWith(".mts")) {
		return sourceCode
	}

	const toolchain = session.target._getToolchain("@enkore/target-js-toolchain")
	const src = toolchain.tsCreateSourceFile(file.absolutePath)

	const dirLevel = path.dirname(file.relativePath).split("/").length
	const root = dirLevel === 0 ? "./" : "../".repeat(dirLevel)

	const aliases = (() => {
		if (file.relativePath.startsWith("embeds/")) {
			return {
				"#~embeds": `${root}embeds`
			}
		}

		return {
			"#~src": `${root}src`,
			"#~embeds": `${root}embeds`,
			"#~export": `${root}export`
		}
	})() as Record<string, string>

	const transformer: MyTSSourceFileTransformer[] = [
		toolchain.tsResolveImportAliases(undefined, aliases)
	]

	const expandStarExports = session.target.getOptions(
		this.target
	).preprocess?.expandStarExports === true

	if (expandStarExports) {
		const {compilerOptions} = toolchain.tsReadTSConfigFile(
			session.project.root, "tsconfig/base.json"
		)

		transformer.push(
			toolchain.tsExpandStarExports(undefined, compilerOptions)
		)
	}

	return toolchain.tsPrintSourceFile(
		toolchain.tsTransformSourceFile(
			src, transformer
		)
	)
}

export function preprocessFactory(context: APIContext) {
	return impl!.bind(context)
}
