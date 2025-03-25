import type {API} from "#~src/API.d.mts"
import {getRealmDependency} from "#~src/getRealmDependency.mts"
import type {NodeAPIMessage} from "@enkore/spec/primitives"
import {getInternalData} from "#~src/getInternalData.mts"

const impl: API["lint"] = async function(session, file) {
	// can do better?:
	// myNewProgram.getModule check
	if (file.wasFiltered) return [];

	let messages: NodeAPIMessage[] = []

	const nodeMyTS = getRealmDependency(session, "@enkore/typescript")
	const myNewProgram = getInternalData(session).myTSProgram

	const mod = myNewProgram.getModule(`build/${file.relativePath}`)

	for (const moduleSpecifier of nodeMyTS.getModuleImportAndExportSpecifiers(mod)) {
		if (moduleSpecifier.endsWith(".mjs")) {
			messages.push({
				severity: "error",
				message: "moduleSpecifier ends with '.mjs'",
				id: "impreciseModuleSpecifier"
			})
		} else if (moduleSpecifier.endsWith(".d.mts")) {
			messages.push({
				severity: "error",
				message: "moduleSpecifier ends with '.d.mts'",
				id: "impreciseModuleSpecifier"
			})
		}
	}

	for (const msg of nodeMyTS.typeCheckModule(mod)) {
		session.enkore.emitMessage(
			"error", msg.message
		)
	}

	return messages
}

export const lint = impl
