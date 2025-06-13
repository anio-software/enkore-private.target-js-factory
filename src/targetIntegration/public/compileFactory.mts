import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import path from "node:path"
import {getInternalData} from "#~src/targetIntegration/getInternalData.mts"
import {getTypeScriptDefinition} from "#~src/targetIntegration/getTypeScriptDefinition.mts"
import {getModuleGuarded} from "#~src/targetIntegration/getModuleGuarded.mts"
import {embedFileBundler} from "#~src/targetIntegration/embedFileBundler.mts"

type OnlyArray<T> = T extends object[] ? T : never
type ObjectFile = OnlyArray<Awaited<ReturnType<API["compile"]>>>[number]

const impl: API["compile"] = async function(
	this: APIContext, session, file, code
) {
	if (file.entityKind === "EnkoreBuildFile") {
		//
		// we don't have to strip types of ".css.mts" files because
		// they don't contain any type information that needs to be stripped
		//
		if (file.fileName.endsWith(".css.mts")) {
			return {
				name: file.fileName.slice(0, -4) + ".mjs",
				contents: code
			}
		}

		return [];
	}

	const ret: ObjectFile[] = []

	const sourceFilePath = file.relativePath
	const fileName = path.basename(sourceFilePath)
	const isEmbedFile = sourceFilePath.startsWith("embeds/")
	const isTypeScriptFile = fileName.endsWith(".mts")
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

	const toolchain = session.target._getToolchain("js")
	const myProgram = getInternalData(session).myTSProgram

	if (isTypeScriptFile) {
		const jsCode = toolchain.stripTypeScriptTypes(code, {
			filePath: path.join(session.project.root, "build", sourceFilePath),
			rewriteImportExtensions: true
		})

		ret.push({
			contents: jsCode,
			name: fileName.slice(0, -4) + ".mjs"
		})

		const myTSModule = getModuleGuarded(myProgram, `build/${sourceFilePath}`)

		ret.push({
			contents: getTypeScriptDefinition(session, myTSModule),
			name: fileName.slice(0, -4) + ".d.mts"
		})
	}

	//
	// generate files necessary for embeds API:
	//
	//    'text://' -> <path>.enkoreRawEmbedFile
	//    'js://' -> <path.slice(0, -4)>.mjs (.mts files only, generated earlier)
	//    'dts://' -> <path.slice(0, -4)>.d.mts (.mts files only, generated earlier)
	//    'js-bundle://' -> <path>.enkoreJsBundleFile (.mts files only)
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
