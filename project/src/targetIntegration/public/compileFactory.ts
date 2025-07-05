import type {API} from "#~src/targetIntegration/API.ts"
import type {APIContext} from "#~src/targetIntegration/APIContext.ts"
import path from "node:path"
import {getInternalData} from "#~src/targetIntegration/getInternalData.ts"
import {getTypeScriptDefinition} from "#~src/targetIntegration/getTypeScriptDefinition.ts"
import {getModuleGuarded} from "#~src/targetIntegration/getModuleGuarded.ts"
import {embedFileBundler} from "#~src/targetIntegration/embedFileBundler.ts"
import {getToolchain} from "#~src/getToolchain.ts"

type OnlyArray<T> = T extends object[] ? T : never
type ObjectFile = OnlyArray<Awaited<ReturnType<API["compile"]>>>[number]

const impl: API["compile"] = async function(
	this: APIContext, session, file, code
) {
	if (file.entityKind === "EnkoreBuildFile") {
		//
		// we don't have to strip types of ".css.ts" files because
		// they don't contain any type information that needs to be stripped
		//
		if (file.fileName.endsWith(".css.ts")) {
			return {
				name: file.fileName.slice(0, -3) + ".js",
				contents: code
			}
		}

		return [];
	}

	const ret: ObjectFile[] = []

	const sourceFilePath = file.relativePath
	const fileName = path.basename(sourceFilePath)
	const isEmbedFile = sourceFilePath.startsWith("embeds/")
	const isTypeScriptFile = fileName.endsWith(".ts")
	const isTSXFile = fileName.endsWith(".tsx")
	const partialBuild = session.enkore.getOptions()._partialBuild === true

	session.enkore.emitMessage("info", "called compile " + sourceFilePath)

	//
	// check early exit condition
	// 1.) if we are doing a partial build, ignore all files that are not
	//     embed files
	// 2.) we have a filtered (unsupported) file that isn't an embed file
	//
	if (!isEmbedFile) {
		if (partialBuild) {
			return "skip"
		}

		if (file.wasFiltered) {
			return "unsupported"
		}
	}

	const toolchain = getToolchain(session)
	const myProgram = getInternalData(session).myTSProgram

	if (isTypeScriptFile || isTSXFile) {
		const {jsCode, jsFileName, dtsFileName} = (() => {
			const options = {
				filePath: path.join(session.project.root, "build", sourceFilePath),
				rewriteImportExtensions: true
			}

			if (isTSXFile) {
				return {
					jsFileName: fileName.slice(0, -4) + ".js",
					dtsFileName: fileName.slice(0, -4) + ".d.ts",
					jsCode: toolchain.transformTSX(code, options)
				}
			}

			return {
				jsFileName: fileName.slice(0, -3) + ".js",
				dtsFileName: fileName.slice(0, -3) + ".d.ts",
				jsCode: toolchain.stripTypeScriptTypes(code, options)
			}
		})()

		ret.push({
			contents: jsCode,
			name: jsFileName
		})

		const myTSModule = getModuleGuarded(myProgram, `build/${sourceFilePath}`)

		ret.push({
			contents: getTypeScriptDefinition(session, myTSModule),
			name: dtsFileName
		})
	}

	//
	// generate files necessary for embeds API:
	//
	//    'text://' -> <path>.enkoreRawEmbedFile
	//    'js://' -> <path.slice(0, -4)>.js (.ts files only, generated earlier)
	//    'dts://' -> <path.slice(0, -4)>.d.ts (.ts files only, generated earlier)
	//    'js-bundle://' -> <path>.enkoreJsBundleFile (.ts files only)
	//
	if (isEmbedFile) {
		ret.push({
			contents: code,
			// this file extension lets us find all "base" embed files
			// from within the objects/ folder :)
			name: `${fileName}.enkoreRawEmbedFile`
		})

		if (isTypeScriptFile) {
			const myTSModule = getModuleGuarded(myProgram, `build/${sourceFilePath}`)
			const exportNames = myTSModule.getModuleExportNames()

			let embedExportCode = `export * from "./build/${file.relativePath}"\n`

			// default export needs to be dealt with separately
			if (exportNames.includes("default")) {
				embedExportCode += `export {default} from "./build/${file.relativePath}"\n`
			}

			ret.push({
				contents: await embedFileBundler(session, embedExportCode),
				name: `${fileName}.enkoreJsBundleFile`
			})
		}
	}

	return ret
}

export function compileFactory(context: APIContext) {
	return impl!.bind(context)
}
