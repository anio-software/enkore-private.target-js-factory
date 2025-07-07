import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {APIContext} from "./APIContext.ts"
import {getInternalData} from "./getInternalData.ts"
import {getExternals} from "./getExternals.ts"
import {getOnRollupLogFunction} from "./getOnRollupLogFunction.ts"
import {generateTypesPackageEntryCode} from "./generateTypesPackageEntryCode.ts"
import {writeAtomicFile} from "@anio-software/pkg.node-fs"
import {getProductPackageJSON} from "./getProductPackageJSON.ts"
import {_prettyPrintPackageJSONExports} from "./_prettyPrintPackageJSONExports.ts"
import {getToolchain} from "#~src/getToolchain.ts"

export async function generateNPMTypesPackage(
	apiContext: APIContext,
	session: EnkoreSessionAPI,
	gitRepositoryDirectory: string,
	packageName: string
) {
	const toolchain = getToolchain(session)

	const {entryPoints} = getInternalData(session)

	for (const [entryPointPath, entryPoint] of entryPoints.entries()) {
		const externals: string[] = getExternals(apiContext, entryPointPath, session, "typePackages")
		const onRollupLogFunction = getOnRollupLogFunction(session)

		const declarationsEntryCode = generateTypesPackageEntryCode(entryPoint)

		const declarationBundle = await toolchain.tsDeclarationBundler(
			session.project.root, declarationsEntryCode, {
				externals,
				onRollupLogFunction
			}
		)

		await writeAtomicFile(
			`./dist/${entryPointPath}/index.d.mts`, declarationBundle, {createParents: true}
		)

		await writeAtomicFile(
			`./dist/${entryPointPath}/index.min.d.mts`, declarationBundle, {createParents: true}
		)
	}

	const packageJSON = getProductPackageJSON(
		apiContext,
		session,
		entryPoints,
		{
			packageName,
			gitRepositoryDirectory,
			typeOnly: true
		}
	)

	await writeAtomicFile(
		`./package.json`, _prettyPrintPackageJSONExports(packageJSON)
	)
}
