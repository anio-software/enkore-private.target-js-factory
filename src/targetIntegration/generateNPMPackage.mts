import type {EnkoreSessionAPI} from "@enkore/spec"
import type {APIContext} from "./APIContext.d.mts"
import {getTargetDependency} from "./getTargetDependency.mts"
import {getInternalData} from "./getInternalData.mts"
import {getExternals} from "./getExternals.mts"
import type {JsBundlerOptions} from "@enkore-types/rollup"
import {getOnRollupLogFunction} from "./getOnRollupLogFunction.mts"
import {generateEntryPointCode} from "./generateEntryPointCode.mts"
import {writeAtomicFile, writeAtomicFileJSON} from "@aniojs/node-fs"
import {getProductPackageJSON} from "./getProductPackageJSON.mts"
import {rollupPluginFactory} from "./rollupPluginFactory.mts"
import {mergeAndHoistGlobalRuntimeDataRecords} from "./mergeAndHoistGlobalRuntimeDataRecords.mts"

async function createDistFiles(
	apiContext: APIContext,
	session: EnkoreSessionAPI
) {
	const utils = getTargetDependency(session, "@enkore/rollup")

	const {entryPointMap} = getInternalData(session)

	for (const [entryPointPath, exportsMap] of entryPointMap.entries()) {
		const externalPackages: string[] = getExternals(apiContext, entryPointPath, session, "packages")
		const externalTypePackages: string[] = getExternals(apiContext, entryPointPath, session, "typePackages")
		const onRollupLogFunction = getOnRollupLogFunction(session)

		const jsBundlerOptions: JsBundlerOptions = {
			treeshake: true,
			externals: externalPackages,
			onRollupLogFunction,
			additionalPlugins: [
				await rollupPluginFactory(session, apiContext, exportsMap)
			]
		}

		const jsEntryCode = generateEntryPointCode(exportsMap, false)
		const declarationsEntryCode = generateEntryPointCode(exportsMap, true)

		const jsBundle = mergeAndHoist(await utils.jsBundler(
			session.project.root, jsEntryCode, {
				...jsBundlerOptions,
				minify: false
			}
		))

		// don't do this, minify jsBundle code
		const minifiedJsBundle = mergeAndHoist(await utils.jsBundler(
			session.project.root, jsEntryCode, {
				...jsBundlerOptions,
				minify: true
			}
		))

		const declarationBundle = await utils.tsDeclarationBundler(
			session.project.root, declarationsEntryCode, {
				externals: externalTypePackages,
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

		function mergeAndHoist(code: string): string {
			return mergeAndHoistGlobalRuntimeDataRecords(session, code)
		}
	}
}

export async function generateNPMPackage(
	apiContext: APIContext,
	session: EnkoreSessionAPI
) {
	const {entryPointMap} = getInternalData(session)

	await createDistFiles(apiContext, session)

	await writeAtomicFileJSON(
		`./package.json`, getProductPackageJSON(
			apiContext,
			session,
			session.project.packageJSON.name,
			entryPointMap,
			false
		), {pretty: true}
	)
}
