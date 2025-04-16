import type {EnkoreSessionAPI} from "@enkore/spec"
import type {APIContext} from "./APIContext.d.mts"
import {getTargetDependency} from "./getTargetDependency.mts"
import {getInternalData} from "./getInternalData.mts"
import {getExternals} from "./getExternals.mts"
import type {JsBundlerOptions} from "@enkore-types/rollup"
import {getOnRollupLogFunction} from "./getOnRollupLogFunction.mts"
import {generateEntryPointCode} from "./generateEntryPointCode.mts"
import {writeAtomicFile, writeAtomicFileJSON, readFileString} from "@aniojs/node-fs"
import {getProductPackageJSON} from "./getProductPackageJSON.mts"
import {generateAPIExportGlueCode} from "#~src/export/generateAPIExportGlueCode.mts"
import {getProjectAPIMethodNames} from "#~synthetic/user/export/project/getProjectAPIMethodNames.mts"
import {generateProjectAPIContext} from "#~assets/project/generateProjectAPIContext.mts"
import {getAsset} from "@fourtune/realm-js/v0/assets"
import {randomIdentifierSync} from "@aniojs/random-ident"
import {getRequestedEmbedsFromFileCached} from "./getRequestedEmbedsFromFileCached.mts"
import type {RequestedEmbedsFromCodeResult} from "@enkore-types/babel"
import {combineRequestedEmbedsFromCodeResults} from "./combineRequestedEmbedsFromCodeResults.mts"

async function createDistFiles(
	apiContext: APIContext,
	session: EnkoreSessionAPI
) {
	const projectContext = await generateProjectAPIContext(session.project.root, false)

	const utils = getTargetDependency(session, "@enkore/rollup")
	const myTS = getTargetDependency(session, "@enkore/typescript")

	const {entryPointMap} = getInternalData(session)

	for (const [entryPointPath, exportsMap] of entryPointMap.entries()) {
		const externalPackages: string[] = getExternals(apiContext, entryPointPath, session, "packages")
		const externalTypePackages: string[] = getExternals(apiContext, entryPointPath, session, "typePackages")
		const onRollupLogFunction = getOnRollupLogFunction(session)
		const projectContextToken = `projectContext_${randomIdentifierSync(64)}`

		const jsBundlerOptions: JsBundlerOptions = {
			treeshake: true,
			externals: externalPackages,
			onRollupLogFunction,
			additionalPlugins: [{
				when: "pre",
				plugin: {
					name: "enkore-target-js-project-plugin",

					resolveId(id: string) {
						if (id === `@enkore-target/js-none/project`) {
							return `\x00enkore-project`
						} else if (id === `\x00generateProjectAPIFromContext`) {
							return `\x00generateProjectAPIFromContext`
						}

						return null
					},

					async transform(code, id) {
						// make sure "id" is always included
						// in this array, it doesn't harm if it already is
						// included.
						const imports = [id, ...Array.from(
							this.getModuleIds()
						)].filter(entry => {
							return entry.startsWith(session.project.root)
						})

						const tmp: RequestedEmbedsFromCodeResult[] = []

						for (const entry of imports) {
							tmp.push(await getRequestedEmbedsFromFileCached(
								apiContext,
								session,
								entry
							))
						}

						const includeEmbeds = combineRequestedEmbedsFromCodeResults(tmp)
						const newProjectContext = {...projectContext}

						if (includeEmbeds[0] === "none") {
							newProjectContext.projectEmbedFileMap = {}
						} else if (includeEmbeds[0] === "specific") {
							const newProjectEmbedFileMap: Record<string, any> = {}

							for (const key in newProjectContext.projectEmbedFileMap) {
								if (!includeEmbeds[1].has(key)) continue

								newProjectEmbedFileMap[key] = newProjectContext.projectEmbedFileMap[key]
							}

							newProjectContext.projectEmbedFileMap = newProjectEmbedFileMap
						}

						return code.split(projectContextToken).join(
							JSON.stringify(JSON.stringify(newProjectContext))
						)
					},

					async load(id: string) {
						if (id === `\x00generateProjectAPIFromContext`) {
							return getAsset("js-bundle://project/generateProjectAPIFromContext.mts") as string
						} else if (id === `\x00enkore-project`) {
							return myTS.stripTypes(
								myTS.createSourceFileFromCode(
									`import {generateProjectAPIFromContext} from "\x00generateProjectAPIFromContext"\n` +
									`const projectContext = JSON.parse(${projectContextToken});\n` +
									`const projectAPI = await generateProjectAPIFromContext(projectContext);\n` +
									`${generateAPIExportGlueCode("API", "projectAPI", getProjectAPIMethodNames())}\n`
								)
							)
						}

						return null
					}
				}
			}]
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
