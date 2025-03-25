import type {EnkoreSessionAPI} from "@enkore/spec"
import {getRealmDependency} from "./getRealmDependency.mts"
import {getInternalData} from "./getInternalData.mts"
import {getExternals} from "./getExternals.mts"
import type {JsBundlerOptions} from "@enkore-types/rollup"
import {getOnRollupLogFunction} from "./getOnRollupLogFunction.mts"
import {generateEntryPointCode} from "./generateEntryPointCode.mts"
import {writeAtomicFile, writeAtomicFileJSON} from "@aniojs/node-fs"
import {getProductPackageJSON} from "#~src/getProductPackageJSON.mts"

export async function generateNPMPackage(session: EnkoreSessionAPI) {
	const utils = getRealmDependency(session, "@enkore-types/rollup")

	const {entryPointMap} = getInternalData(session)

	for (const [entryPointPath, exportsMap] of entryPointMap.entries()) {
		const externals: string[] = getExternals(entryPointPath, session)
		const onRollupLogFunction = getOnRollupLogFunction(session)

		const jsBundlerOptions: JsBundlerOptions = {
			treeshake: true,
			externals,
			onRollupLogFunction
		}

		const jsEntryCode = generateEntryPointCode(exportsMap, false)
		const declarationsEntryCode = generateEntryPointCode(exportsMap, true)

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
			session.project.root, declarationsEntryCode, {
				externals,
				onRollupLogFunction
			}
		)

		await writeAtomicFile(
			`./dist/${entryPointPath}/index.mjs`, jsBundle, {createParents: true}
		)

		await writeAtomicFile(
			`./dist/${entryPointPath}/index.min.mjs`, minifiedJsBundle, {createParents: true}
		)

		await writeAtomicFile(
			`./dist/${entryPointPath}/index.d.mts`, declarationBundle, {createParents: true}
		)
	}

	await writeAtomicFileJSON(
		`./package.json`, getProductPackageJSON(
			session,
			session.project.packageJSON.name,
			entryPointMap,
			false
		), {pretty: true}
	)
}
