import type {API} from "#~src/API.d.mts"
import type {APIContext} from "#~src/APIContext.d.mts"
import {getTargetDependency} from "#~src/getTargetDependency.mts"
import path from "node:path"
import {getInternalData} from "#~src/getInternalData.mts"
import type {MyTSModule} from "@enkore-types/typescript"

const impl: API["compile"] = async function(
	this: APIContext, session, file, code
) {
	const sourceFilePath = file.relativePath
	const fileName = path.basename(sourceFilePath)
	const isTypeScriptFile = fileName.endsWith(".mts")

	session.enkore.emitMessage("info", "called compile " + sourceFilePath)

	const nodeMyTS = getTargetDependency(session, "@enkore/typescript")
	const myProgram = getInternalData(session).myTSProgram

	if (sourceFilePath.startsWith("assets/")) {
		const ret = [{
			contents: code,
			name: fileName + ".txt"
		}]

		// todo: handle/allow .mjs files?
		if (isTypeScriptFile) {
			const myTSModule = myProgram.getModule(`build/${sourceFilePath}`)

			ret.push({
				contents: nodeMyTS.stripTypes(myTSModule.source, true),
				name: fileName.slice(0, -4) + ".mjs.txt"
			})

			ret.push({
				contents: getTypeScriptDefinition(myTSModule),
				name: fileName.slice(0, -4) + ".d.mts.txt"
			})
		}

		return ret
	}

	if (file.wasFiltered) return "ignore"

	const myTSModule = myProgram.getModule(`build/${sourceFilePath}`)

	return [{
		contents: nodeMyTS.stripTypes(myTSModule.source, true),
		name: fileName.slice(0, -4) + ".mjs"
	}, {
		contents: getTypeScriptDefinition(myTSModule),
		name: fileName.slice(0, -4) + ".d.mts"
	}]

	// todo: move into separate file
	function getTypeScriptDefinition(mod: MyTSModule): string {
		const {declarations,diagnosticMessages} = nodeMyTS.generateDeclarationsForModule(
			mod, (ctx) => {
				return [
					nodeMyTS.expandModuleImportAndExportDeclarations(ctx),
					// fix imports
					nodeMyTS.remapModuleImportAndExportSpecifiers(ctx, (moduleSpecifier, decl) => {
						if (moduleSpecifier.endsWith(".d.mts")) {
							return undefined
						}

						if (moduleSpecifier.endsWith(".mts")) {
							if (decl.isTypeOnly) {
								return moduleSpecifier.slice(0, -4) + ".d.mts"
							} else {
								return moduleSpecifier.slice(0, -4) + ".mjs"
							}
						}

						return undefined
					})
				]
			}
		)

		for (const msg of diagnosticMessages) {
			session.enkore.emitMessage(
				"error", msg.message
			)
		}

		return declarations
	}
}

export function compileFactory(context: APIContext) {
	return impl!.bind(context)
}
