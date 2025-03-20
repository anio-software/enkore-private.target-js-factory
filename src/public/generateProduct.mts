import type {API} from "#~src/API.d.mts"
import {getInternalData} from "#~src/getInternalData.mts"
import {getRealmDependency} from "#~src/getRealmDependency.mts"
import {generateEntryPointCode} from "#~src/generateEntryPointCode.mts"
import type {JsBundlerOptions} from "@enkore-types/realm-js-and-web-utils"
import path from "node:path"
import {writeAtomicFile} from "@aniojs/node-fs"

const impl: API["generateProduct"] = async function(
	session, productName
) {
	const utils = getRealmDependency(session, "@enkore/realm-js-and-web-utils")

	for (const [entryPointPath, entryPointMap] of getInternalData(session).entryPointMap.entries()) {
		const jsBundlerOptions: JsBundlerOptions = {
			treeshake: true,
			externals: [],
			onRollupLogFunction(level, message) {
				
			}
		}

		const jsEntryCode = generateEntryPointCode(entryPointMap, false)
		const declarationsEntryCode = generateEntryPointCode(entryPointMap, true)

		const jsBundle = await utils.jsBundler(
			session.project.root, jsEntryCode, {
				...jsBundlerOptions,
				minify: false
			}
		)

		const minifiedJsBundle = await utils.jsBundler(
			session.project.root, jsEntryCode, {
				...jsBundlerOptions,
				minify: true
			}
		)

		const declarationBundle = await utils.tsDeclarationBundler(
			session.project.root, declarationsEntryCode, {}
		)

		//await writeAtomicFile(
		//	path.join(`/tmp/enkoretest/dist/pkg/${entryPointPath}/index.mjs`), jsBundle, {createParents: true}
		//)

		//await writeAtomicFile(
		//	path.join(`/tmp/enkoretest/dist/pkg/${entryPointPath}/index.min.mjs`), minifiedJsBundle, {createParents: true}
		//)

		//await writeAtomicFile(
		//	path.join(`/tmp/enkoretest/dist/pkg/${entryPointPath}/index.d.mts`), declarationBundle, {createParents: true}
		//)
	}
}

export const generateProduct = impl
