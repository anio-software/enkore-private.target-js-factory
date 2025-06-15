import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import path from "node:path"
import type {MyTSSourceFileTransformer} from "@anio-software/enkore-private.target-js-toolchain_types"
import {getInternalData} from "../getInternalData.mts"
import {resolveImportSpecifierFromProjectRoot} from "@anio-software/enkore-private.spec/utils"
import {isNumber} from "@anio-software/pkg.is"

const impl: API["preprocess"] = async function(
	this: APIContext, session, file, sourceCode, emitFileMessage
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
			name: file.fileName.slice(0, -4) + ".css.ts",
			contents: cssTSFileContents
		}]
	}

	if (
		!file.fileName.endsWith(".ts") &&
		!file.fileName.endsWith(".tsx")) {
		return sourceCode
	}

	const src = toolchain.tsCreateSourceFile(file.absolutePath)

	//
	// NB: don't attempt to transform code that has syntax errors.
	// They will not get picked up on, since the type checking is done
	// on the output of the pre-processing stage!
	//
	const syntaxErrors = toolchain.tsIdentifySyntaxErrors(src)

	if (syntaxErrors.length) {
		for (const {origin, message} of syntaxErrors) {
			if (isNumber(origin.line)) {
				emitFileMessage("error", `Syntax error on line ${origin.line}: ${message}`)
			} else {
				emitFileMessage("error", `Syntax error: ${message}`)
			}
		}

		return sourceCode
	}

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
		toolchain.tsRemapModuleImportAndExportSpecifiers(undefined, (specifier, decl, remove) => {
			if (specifier.endsWith(".css")) {
				if (specifier.startsWith("./") || specifier.startsWith("../")) {
					return `${specifier}.ts`
				}

				const resolved = resolveImportSpecifierFromProjectRoot(
					session.project.root, specifier
				)

				if (resolved) {
					getInternalData(session).externalCSSFiles.push(resolved)

					return remove()
				}
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
