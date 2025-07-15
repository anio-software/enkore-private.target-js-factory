import type {
	EnkoreSessionAPI,
	EnkoreJSRuntimeProjectAPIContext
} from "@anio-software/enkore-private.spec"
import type {APIContext} from "./APIContext.ts"
import {getInternalData} from "./getInternalData.ts"
import {getExternals} from "./getExternals.ts"
import {enkoreJSRuntimeInitCodeHeaderMarkerUUID} from "@anio-software/enkore-private.spec/uuid"
import type {JsBundlerOptions} from "@anio-software/enkore-private.target-js-toolchain_types"
import {getOnRollupLogFunction} from "./getOnRollupLogFunction.ts"
import {generateEntryPointCode} from "./generateEntryPointCode.ts"
import {writeAtomicFile, readFileString, writeAtomicFileJSON, isFileSync} from "@anio-software/pkg.node-fs"
import {getProductPackageJSON} from "./getProductPackageJSON.ts"
import {rollupCSSStubPluginFactory} from "./rollupCSSStubPluginFactory.ts"
import {rollupPluginFactory} from "./rollupPluginFactory.ts"
import {_prettyPrintPackageJSONExports} from "./_prettyPrintPackageJSONExports.ts"
import {getToolchain} from "#~src/getToolchain.ts"
import {updateEntryPointsMap} from "./updateEntryPointsMap.ts"
import {generateRuntimeInitCode} from "./generateRuntimeInitCode.ts"
import {getEnkoreBuildFileData} from "./getEnkoreBuildFileData.ts"
import {getEnkoreManifestFileData} from "./getEnkoreManifestFileData.ts"
import {generateProjectAPIContext} from "./generateProjectAPIContext.ts"
import {parseEmbedURL} from "@anio-software/enkore-private.spec/utils"
import runtimeHelpers from "@anio-software/enkore-private.js-runtime-helpers/_source/v0"
import path from "node:path"

function src(code: string) {
	return `export default ${JSON.stringify(code)};\n`
}

function isSideEffectFreeImport(id: string): boolean {
	if (id.startsWith("node:")) {
		return true
	} else if (id.startsWith(`@anio-software/enkore-private.js-runtime-helpers`)) {
		return true
	} else if (id.startsWith("@anio-software/enkore.js-runtime")) {
		return true
	}

	return false
}

async function minifyJSBundle(session: EnkoreSessionAPI, bundle: string): Promise<string> {
	const toolchain = getToolchain(session)
	const isProductionBuild: boolean = (() => {
		if (session.enkore.getOptions().buildMode === "development") {
			return false
		}

		return true
	})()

	if (isProductionBuild) {
		session.enkore.emitMessage(`info`, `minifying javascript bundle`)
	}

	// bundle js-runtime-helpers
	const newBundle = await toolchain.jsBundler(
		session.project.root, bundle, {
			additionalPlugins: [{
				when: "pre",
				plugin: {
					name: "enkore-runtime-helper-resolver",

					resolveId(id) {
						if (id.startsWith("@anio-software/enkore-private.js-runtime-helpers")) {
							return "\x00enkore:js-runtime-helpers"
						}

						return null
					},

					load(id) {
						if (id === `\x00enkore:js-runtime-helpers`) {
							return runtimeHelpers
						}

						return null
					}
				}
			}],
			treeshake: {
				moduleSideEffects(id) {
					return !isSideEffectFreeImport(id)
				}
			}
		}
	)

	return isProductionBuild ? toolchain.jsMinify(newBundle) : newBundle
}

async function createDistFiles(
	apiContext: APIContext,
	projectAPIContext: EnkoreJSRuntimeProjectAPIContext,
	session: EnkoreSessionAPI
) {
	const toolchain = getToolchain(session)

	const {entryPoints} = getInternalData(session)

	for (const [entryPointPath, entryPoint] of entryPoints.entries()) {
		const externalPackages: string[] = getExternals(apiContext, entryPointPath, session, "packages")
		const externalTypePackages: string[] = getExternals(apiContext, entryPointPath, session, "typePackages")
		const onRollupLogFunction = getOnRollupLogFunction(session)

		const jsBundlerOptions: JsBundlerOptions = {
			treeshake: {
				moduleSideEffects(id) {
					return !isSideEffectFreeImport(id)
				}
			},
			externals: externalPackages,
			onRollupLogFunction,
			additionalPlugins: [
				rollupCSSStubPluginFactory(session),
				await rollupPluginFactory(session, apiContext, projectAPIContext)
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

		const minifiedJsBundle = await minifyJSBundle(session, jsBundle)

		const declarationBundle = await toolchain.tsDeclarationBundler(
			session.project.root, declarationsEntryCode, {
				externals: externalTypePackages,
				onRollupLogFunction
			}
		)

		const runtimeInitCode = await generateRuntimeInitCode(
			apiContext, session, projectAPIContext, entryPoint
		)

		let runtime = ""

		if (runtimeInitCode.trim().length) {
			const runtimeInitCodeSeparator = `;\n/* end of runtime init code */;\n`
			const runtimeCodeSize = runtimeInitCode.length + runtimeInitCodeSeparator.length
			const runtimeInitCodeHeader = `/*${enkoreJSRuntimeInitCodeHeaderMarkerUUID}:${runtimeCodeSize}*/`

			runtime = runtimeInitCodeHeader + runtimeInitCode + runtimeInitCodeSeparator
		}

		await writeDistFile(`${entryPointPath}/index.mjs`, runtime + jsBundle)
		await writeDistFile(`${entryPointPath}/index.min.mjs`, runtime + minifiedJsBundle)
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
	const projectAPIContext = await generateProjectAPIContext(session.project.root, false)

	// todo: run this in postCompile hook
	await updateEntryPointsMap(apiContext, projectAPIContext, session)

	const {entryPoints, binScripts} = getInternalData(session)

	await createDistFiles(apiContext, projectAPIContext, session)

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

	await writeAtomicFileJSON(
		"./enkore-build.json",
		await getEnkoreBuildFileData(apiContext, session),
		{pretty: true}
	)

	await writeAtomicFileJSON(
		"./enkore-manifest.json",
		getEnkoreManifestFileData(session, entryPoints),
		{pretty: true}
	)

	for (const [, {localEmbeds}] of entryPoints.entries()) {
		if (localEmbeds === "none") continue

		for (const [embedURL] of localEmbeds.entries()) {
			const {protocol, path: relativeSourcePath} = parseEmbedURL(embedURL)
			const embed = projectAPIContext._projectEmbedFileMapRemoveMeInBundle!.get(embedURL)!

			const globalIdentifier = `${packageJSON.name}/v${packageJSON.version}/${protocol}/${relativeSourcePath}`
			const destinationPath = `./_embeds/${globalIdentifier}`

			if (isFileSync(destinationPath)) continue

			await writeAtomicFile(
				destinationPath,
				embed.data,
				{createParents: true}
			)
		}
	}

	for (const [_, {remoteEmbeds}] of entryPoints.entries()) {
		for (const [globalIdentifier, {absoluteSourceFilePath}] of remoteEmbeds.entries()) {
			const destinationPath = `./_embeds/${globalIdentifier}`

			if (isFileSync(destinationPath)) continue

			await writeAtomicFile(
				destinationPath,
				await readFileString(absoluteSourceFilePath),
				{createParents: true}
			)
		}
	}
}
