import type {EnkoreSessionAPI} from "@enkore/spec"
import {getRealmDependency} from "./getRealmDependency.mts"
import {getInternalData} from "./getInternalData.mts"
import {getExternals} from "./getExternals.mts"
import type {JsBundlerOptions} from "@enkore-types/realm-js-and-web-utils"
import {generateEntryPointCode} from "./generateEntryPointCode.mts"

export async function generateNPMPackage(session: EnkoreSessionAPI): Promise<string> {
	const utils = getRealmDependency(session, "@enkore/realm-js-and-web-utils")

	const {entryPointMap} = getInternalData(session)

	for (const [entryPointPath, exportsMap] of entryPointMap.entries()) {
		const externals: string[] = getExternals(entryPointPath, session)

		type LogFn = JsBundlerOptions["onRollupLogFunction"]

		const onRollupLogFunction: LogFn = (level, message) => {

		}

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

	return ""
}
