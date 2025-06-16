import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {APIContext} from "./APIContext.d.mts"
import {getInternalData} from "./getInternalData.mts"
import {getExternals} from "./getExternals.mts"
import {getOnRollupLogFunction} from "./getOnRollupLogFunction.mts"
import {generateTypesPackageEntryCode} from "./generateTypesPackageEntryCode.mts"
import {writeAtomicFile, writeAtomicFileJSON} from "@aniojs/node-fs"
import {getProductPackageJSON} from "./getProductPackageJSON.mts"

export async function generateNPMTypesPackage(
	apiContext: APIContext,
	session: EnkoreSessionAPI,
	directory: string,
	packageName: string
) {
	const toolchain = session.target._getToolchain("js")

	const {entryPoints} = getInternalData(session)

	for (const [entryPointPath, exportsMap] of entryPoints.entries()) {
		const externals: string[] = getExternals(apiContext, entryPointPath, session, "typePackages")
		const onRollupLogFunction = getOnRollupLogFunction(session)

		const declarationsEntryCode = generateTypesPackageEntryCode(exportsMap)

		const declarationBundle = await toolchain.tsDeclarationBundler(
			session.project.root, declarationsEntryCode, {
				externals,
				onRollupLogFunction
			}
		)

		await writeAtomicFile(
			`./dist/${entryPointPath}/index.d.mts`, declarationBundle, {createParents: true}
		)
	}

	await writeAtomicFileJSON(
		`./package.json`, getProductPackageJSON(
			apiContext,
			session,
			packageName,
			directory,
			entryPoints,
			true
		), {pretty: true}
	)
}
