import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import path from "node:path"
import type {MyTSSourceFileTransformer} from "@anio-software/enkore-private.target-js-toolchain_types"
import {getInternalData} from "../getInternalData.mts"

const impl: API["preprocess"] = async function(
	this: APIContext, session, file, sourceCode
) {
	const toolchain = session.target._getToolchain("js")

	if (file.fileName.endsWith(".css")) {
		const {projectId} = getInternalData(session)
		const shortProjectId = projectId.slice(0, 8) + projectId.slice(-8)

		const result = await toolchain.cssTransform(
			session.project.root, sourceCode, {
				fileName: file.absolutePath,
				cssModulesPattern: `enkore-project-${shortProjectId}-[local]`
			}
		)

		let cssTSFileContents = `const classNames = {\n`

		for (const className in result.classNames) {
			const cssClassName = result.classNames[className]

			cssTSFileContents += `    "${className}": "${cssClassName}"\n`
		}

		cssTSFileContents += `}\n`
		cssTSFileContents += `export default classNames;\n`

		return [{
			name: file.fileName,
			contents: result.code
		}, {
			name: file.fileName.slice(0, -4) + ".css.mts",
			contents: cssTSFileContents
		}]
	}

	if (!file.fileName.endsWith(".mts")) {
		return sourceCode
	}

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
		toolchain.tsResolveImportAliases(undefined, aliases),
		toolchain.tsRemapModuleImportAndExportSpecifiers(undefined, (specifier) => {
			if (specifier.endsWith(".css")) {
				return `${specifier}.mts`
			}

			return specifier
		})
	]

	const expandStarExports = session.target.getOptions(
		"js"
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
