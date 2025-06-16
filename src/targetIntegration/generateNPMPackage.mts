import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {APIContext} from "./APIContext.d.mts"
import {getInternalData} from "./getInternalData.mts"
import {getExternals} from "./getExternals.mts"
import type {JsBundlerOptions} from "@anio-software/enkore-private.target-js-toolchain_types"
import {getOnRollupLogFunction} from "./getOnRollupLogFunction.mts"
import {generateEntryPointCode} from "./generateEntryPointCode.mts"
import {writeAtomicFile, writeAtomicFileJSON} from "@aniojs/node-fs"
import {getProductPackageJSON} from "./getProductPackageJSON.mts"
import {rollupCSSStubPluginFactory} from "./rollupCSSStubPluginFactory.mts"
import {rollupPluginFactory} from "./rollupPluginFactory.mts"
import {mergeAndHoistGlobalRuntimeDataRecords} from "./mergeAndHoistGlobalRuntimeDataRecords.mts"
import {_prettyPrintPackageJSONExports} from "./_prettyPrintPackageJSONExports.mts"
import path from "node:path"

function src(code: string) {
	return `export default ${JSON.stringify(code)};\n`
}

async function createDistFiles(
	apiContext: APIContext,
	session: EnkoreSessionAPI
) {
	const toolchain = session.target._getToolchain("js")

	const {entryPoints} = getInternalData(session)

	for (const [entryPointPath, entryPoint] of entryPoints.entries()) {
		const externalPackages: string[] = getExternals(apiContext, entryPointPath, session, "packages")
		const externalTypePackages: string[] = getExternals(apiContext, entryPointPath, session, "typePackages")
		const onRollupLogFunction = getOnRollupLogFunction(session)

		const jsBundlerOptions: JsBundlerOptions = {
			treeshake: true,
			externals: externalPackages,
			onRollupLogFunction,
			additionalPlugins: [
				rollupCSSStubPluginFactory(session),
				await rollupPluginFactory(session, apiContext, entryPointPath, entryPoint)
			]
		}

		const jsEntryCode = generateEntryPointCode(entryPoint, "js")
		const declarationsEntryCode = generateEntryPointCode(entryPoint, "dts")

		const jsBundle = mergeAndHoist(await toolchain.jsBundler(
			session.project.root, jsEntryCode, {
				...jsBundlerOptions,
				minify: false
			}
		))

		// todo: don't do this, minify jsBundle code
		const minifiedJsBundle = mergeAndHoist(await toolchain.jsBundler(
			session.project.root, jsEntryCode, {
				...jsBundlerOptions,
				minify: true
			}
		))

		const declarationBundle = await toolchain.tsDeclarationBundler(
			session.project.root, declarationsEntryCode, {
				externals: externalTypePackages,
				onRollupLogFunction
			}
		)

		await writeDistFile(`${entryPointPath}/index.mjs`, jsBundle)
		await writeDistFile(`${entryPointPath}/index.min.mjs`, minifiedJsBundle)
		await writeDistFile(`${entryPointPath}/index.d.mts`, declarationBundle)

		if (entryPoint.hasCSSImports) {
			const cssEntryCode = generateEntryPointCode(entryPoint, "css")

			const cssBundle = await toolchain.cssBundle(
				session.project.root, cssEntryCode, {
					fileName: path.join(
						session.project.root, "package.css"
					)
				}
			)

			await writeDistFile(`${entryPointPath}/style.css`, cssBundle)
		}

		function mergeAndHoist(code: string): string {
			return mergeAndHoistGlobalRuntimeDataRecords(session, entryPointPath, code)
		}

		async function writeDistFile(path: string, code: string) {
			const srcDecl = `declare const defaultExport: string;\nexport default defaultExport;\n`
			await writeAtomicFile(`./dist/${path}`, code, {createParents: true})

			if (path.endsWith(".mjs")) {
				await writeAtomicFile(`./_source/${path}`, src(code), {createParents: true})
				await writeAtomicFile(`./_source/${path.slice(0, -4)}.d.mts`, srcDecl)
			} else if (path.endsWith(".css")) {
				await writeAtomicFile(`./_source/${path}.mjs`, src(code), {createParents: true})
				await writeAtomicFile(`./_source/${path}.d.mts`, srcDecl)
			}
		}
	}
}

export async function generateNPMPackage(
	apiContext: APIContext,
	session: EnkoreSessionAPI,
	directory: string,
	packageName: string
) {
	const {entryPoints} = getInternalData(session)

	await createDistFiles(apiContext, session)

	const packageJSON = getProductPackageJSON(
		apiContext,
		session,
		packageName,
		directory,
		entryPoints,
		false
	)

	await writeAtomicFile(
		`./package.json`, _prettyPrintPackageJSONExports(packageJSON)
	)
}
