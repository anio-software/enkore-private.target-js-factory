import type {EnkoreSessionAPI} from "@enkore/spec"
import type {APIContext} from "./APIContext.d.mts"
import {getTargetDependency} from "./getTargetDependency.mts"
import {getInternalData} from "./getInternalData.mts"
import {getExternals} from "./getExternals.mts"
import {getOnRollupLogFunction} from "./getOnRollupLogFunction.mts"
import {generateTypesPackageEntryCode} from "./generateTypesPackageEntryCode.mts"
import {writeAtomicFile, writeAtomicFileJSON} from "@aniojs/node-fs"
import {getProductPackageJSON} from "./getProductPackageJSON.mts"

export async function generateNPMTypesPackage(
	apiContext: APIContext,
	session: EnkoreSessionAPI
) {
	const utils = getTargetDependency(session, "@enkore/rollup")

	const {entryPointMap} = getInternalData(session)

	for (const [entryPointPath, exportsMap] of entryPointMap.entries()) {
		const externals: string[] = getExternals(apiContext, entryPointPath, session)
		const onRollupLogFunction = getOnRollupLogFunction(session)

		const declarationsEntryCode = generateTypesPackageEntryCode(exportsMap)

		const declarationBundle = await utils.tsDeclarationBundler(
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

	const packageName = (() => {
		let {orgName} = targetOptions.createTypesPackage

		if (orgName.startsWith("@")) orgName = orgName.slice(1)

		if (!session.project.packageJSON.name.startsWith("@")) {
			return `@${orgName}/${session.project.packageJSON.name}`
		}

		const [_, packageName] = session.project.packageJSON.name.split("/")

		return `@${orgName}/${packageName}`
	})()

	await writeAtomicFileJSON(
		`./package.json`, getProductPackageJSON(
			apiContext,
			session,
			packageName,
			entryPointMap,
			true
		), {pretty: true}
	)
}
