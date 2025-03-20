import type {EnkoreSessionAPI} from "@enkore/spec"
import {getRealmDependency} from "./getRealmDependency.mts"
import {getInternalData} from "./getInternalData.mts"
import {getExternals} from "./getExternals.mts"
import type {JsBundlerOptions} from "@enkore-types/realm-js-and-web-utils"
import {generateTypesPackageEntryCode} from "./generateTypesPackageEntryCode.mts"

export async function generateNPMTypesPackage(session: EnkoreSessionAPI): Promise<string> {
	const utils = getRealmDependency(session, "@enkore/realm-js-and-web-utils")

	const {entryPointMap} = getInternalData(session)

	for (const [entryPointPath, exportsMap] of entryPointMap.entries()) {
		const externals: string[] = getExternals(entryPointPath, session)

		type LogFn = JsBundlerOptions["onRollupLogFunction"]

		const onRollupLogFunction: LogFn = (level, message) => {

		}

		const declarationsEntryCode = generateTypesPackageEntryCode(exportsMap)

		const declarationBundle = await utils.tsDeclarationBundler(
			session.project.root, declarationsEntryCode, {
				externals,
				onRollupLogFunction
			}
		)
	}

	return ""
}
