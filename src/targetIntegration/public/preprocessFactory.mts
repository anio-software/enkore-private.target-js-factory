import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import {getTargetDependency} from "#~src/targetIntegration/getTargetDependency.mts"
import path from "node:path"
import type {MyTSSourceFileTransformer} from "@enkore-types/target-js-toolchain"

const impl: API["preprocess"] = async function(
	this: APIContext, session, file, sourceCode
) {
	if (!file.fileName.endsWith(".mts")) {
		return sourceCode
	}

	const nodeMyTS = getTargetDependency(session, "@enkore/typescript")
	const src = nodeMyTS.createSourceFile(file.absolutePath)

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
		nodeMyTS.resolveImportAliases(undefined, aliases)
	]

	const expandStarExports = session.target.getOptions(
		this.target
	).preprocess?.expandStarExports === true

	if (expandStarExports) {
		const {compilerOptions} = nodeMyTS.readTSConfigFile(
			session.project.root, "tsconfig/base.json"
		)

		transformer.push(
			nodeMyTS.expandStarExports(undefined, compilerOptions)
		)
	}

	return nodeMyTS.printSourceFile(
		nodeMyTS.transformSourceFile(
			src, transformer
		)
	)
}

export function preprocessFactory(context: APIContext) {
	return impl!.bind(context)
}
