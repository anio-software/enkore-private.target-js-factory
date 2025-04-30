import type {EnkoreSessionAPI} from "@enkore/spec"
import type {APIContext} from "./APIContext.d.mts"
import {getInternalData} from "./getInternalData.mts"
import {getExternals} from "./getExternals.mts"
import {getOnRollupLogFunction} from "./getOnRollupLogFunction.mts"
import {generateTypesPackageEntryCode} from "./generateTypesPackageEntryCode.mts"
import {writeAtomicFile, writeAtomicFileJSON} from "@aniojs/node-fs"
import {getProductPackageJSON} from "./getProductPackageJSON.mts"

export function generateNPMTypesPackageName(
	apiContext: APIContext,
	session: EnkoreSessionAPI,
	typePackageName: string
): string {
	const targetOptions = session.target.getOptions(apiContext.target)

	if (!targetOptions.createTypesPackage) {
		throw new Error(`targetOptions.createTypesPackage must be set here!`)
	}

	let {orgName} = targetOptions.createTypesPackage

	if (orgName.startsWith("@")) orgName = orgName.slice(1)

	if (!typePackageName.startsWith("@")) {
		return `@${orgName}/${typePackageName}`
	}

	const [_, packageName] = typePackageName.split("/");

	return `@${orgName}/${packageName}`
}

export async function generateNPMTypesPackage(
	apiContext: APIContext,
	session: EnkoreSessionAPI,
	directory: string,
	typePackageName: string
) {
	const toolchain = getTargetDependency(session, "@enkore/target-js-toolchain")

	const {entryPointMap} = getInternalData(session)

	for (const [entryPointPath, exportsMap] of entryPointMap.entries()) {
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

	const targetOptions = session.target.getOptions(apiContext.target)

	if (typeof targetOptions.createTypesPackage === "undefined") {
		throw new Error(`createTypesPackage is undefined`)
	}

	const packageName = generateNPMTypesPackageName(
		apiContext,
		session,
		typePackageName
	)

	await writeAtomicFileJSON(
		`./package.json`, getProductPackageJSON(
			apiContext,
			session,
			packageName,
			directory,
			entryPointMap,
			true
		), {pretty: true}
	)
}
