import type {API} from "#~src/API.d.mts"
import {getRealmDependency} from "#~src/getRealmDependency.mts"
import path from "node:path"

const impl: API["preprocess"] = async function(
	session, file, sourceCode
) {
	if (!file.fileName.endsWith(".mts")) {
		return sourceCode
	}

	const nodeMyTS = getRealmDependency(session, "@enkore/typescript")
	const src = nodeMyTS.createSourceFile(file.absolutePath)

	const dirLevel = path.dirname(file.relativePath).split("/").length
	const root = dirLevel === 0 ? "./" : "../".repeat(dirLevel)

	const aliases = (() => {
		if (file.relativePath.startsWith("assets/")) {
			return {
				"#~assets": `${root}assets`
			}
		}

		return {
			"#~src": `${root}src`,
			"#~assets": `${root}assets`,
			"#~export": `${root}export`
		}
	})() as Record<string, string>

	return nodeMyTS.printSourceFile(
		nodeMyTS.transformSourceFile(
			src, nodeMyTS.resolveImportAliases(undefined, aliases)
		)
	)
}

export const preprocess = impl
