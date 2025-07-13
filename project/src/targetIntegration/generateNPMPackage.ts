import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {APIContext} from "./APIContext.ts"
import {getInternalData} from "./getInternalData.ts"
import {getExternals} from "./getExternals.ts"
import type {JsBundlerOptions} from "@anio-software/enkore-private.target-js-toolchain_types"
import {getOnRollupLogFunction} from "./getOnRollupLogFunction.ts"
import {generateEntryPointCode} from "./generateEntryPointCode.ts"
import {writeAtomicFile, readFileString} from "@anio-software/pkg.node-fs"
import {getProductPackageJSON} from "./getProductPackageJSON.ts"
import {rollupCSSStubPluginFactory} from "./rollupCSSStubPluginFactory.ts"
import {rollupPluginFactory} from "./rollupPluginFactory.ts"
import {_prettyPrintPackageJSONExports} from "./_prettyPrintPackageJSONExports.ts"
import {getToolchain} from "#~src/getToolchain.ts"
import path from "node:path"

function src(code: string) {
	return `export default ${JSON.stringify(code)};\n`
}

async function createDistFiles(
	apiContext: APIContext,
	session: EnkoreSessionAPI
) {
	const isProductionBuild: boolean = (() => {
		if (session.enkore.getOptions().buildMode === "development") {
			return false
		}

		return true
	})()

	const toolchain = getToolchain(session)

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

		const jsBundle = await toolchain.jsBundler(
			session.project.root, jsEntryCode, {
				...jsBundlerOptions,
				minify: false
			}
		)

		if (isProductionBuild) {
			session.enkore.emitMessage(`info`, `minifying javascript bundle`)
		}

		const minifiedJsBundle = isProductionBuild ? await toolchain.jsMinify(jsBundle) : jsBundle

		const declarationBundle = await toolchain.tsDeclarationBundler(
			session.project.root, declarationsEntryCode, {
				externals: externalTypePackages,
				onRollupLogFunction
			}
		)

		const runtimeInitCode = ""
		const separator = `\n/** end of runtime init code **/\n`

		await writeDistFile(`${entryPointPath}/index.mjs`, runtimeInitCode + separator + jsBundle)
		await writeDistFile(`${entryPointPath}/index.min.mjs`, runtimeInitCode + separator + minifiedJsBundle)
		await writeDistFile(`${entryPointPath}/index.d.mts`, declarationBundle)
		await writeDistFile(`${entryPointPath}/index.min.d.mts`, declarationBundle)

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
	gitRepositoryDirectory: string,
	packageName: string
) {
	const {entryPoints, binScripts} = getInternalData(session)

	await createDistFiles(apiContext, session)

	const packageJSON = getProductPackageJSON(
		apiContext,
		session,
		entryPoints,
		{
			packageName,
			gitRepositoryDirectory,
			typeOnly: false,
			binScripts
		}
	)

	//
	// scripts (project/bin) are **never** bundled but copied as is (with types removed)
	//
	const {stripTypeScriptTypes} = getToolchain(session)

	for (const binScript of binScripts) {
		const script = await readFileString(
			path.join(session.project.root, "build", "bin", `${binScript}.ts`)
		)

		const jsCode = stripTypeScriptTypes(script, {
			rewriteImportExtensions: true
		})

		const defaultShebang = `#!/usr/bin/env node`

		const scriptCode: string = (() => {
			if (jsCode.startsWith("#!")) {
				return jsCode
			}

			return `${defaultShebang}\n${jsCode}\n`
		})()

		await writeAtomicFile(`./bin/${binScript}.mjs`, scriptCode, {
			createParents: true,
			mode: 0o755
		})
	}

	await writeAtomicFile(
		`./package.json`, _prettyPrintPackageJSONExports(packageJSON)
	)
}
