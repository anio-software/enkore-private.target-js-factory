import type {API} from "#~src/targetIntegration/API.ts"
import type {APIContext} from "#~src/targetIntegration/APIContext.ts"
import type {NodeAPIMessage} from "@anio-software/enkore-private.spec/primitives"
import {getInternalData} from "#~src/targetIntegration/getInternalData.ts"
import {getToolchain} from "#~src/getToolchain.ts"

const impl: API["lint"] = async function(
	this: APIContext, session, file
) {
	// don't lint build files
	if (file.entityKind === "EnkoreBuildFile") return [];
	// ignore filtered files
	if (file.wasFiltered) return [];
	// ignore .css files
	if (file.fileName.endsWith(".css")) return [];

	const toolchain = getToolchain(session)
	const myNewProgram = getInternalData(session).myTSProgram

	const mod = myNewProgram.getModule(`build/${file.relativePath}`)

	if (!mod) {
		// not an error if we are doing a partial build
		if (session.enkore.getOptions()._partialBuild === true) {
			return []
		}

		return [{
			severity: "error",
			id: undefined,
			message: `failed to find module for file 'build/${file.relativePath}'`
		}]
	}

	let messages: NodeAPIMessage[] = []

	for (const moduleSpecifier of toolchain.tsGetModuleImportAndExportSpecifiers(mod)) {
		if (moduleSpecifier.endsWith(".js")) {
			messages.push({
				severity: "error",
				message: "moduleSpecifier ends with '.js'",
				id: "impreciseModuleSpecifier"
			})
		} else if (moduleSpecifier.endsWith(".d.ts")) {
			messages.push({
				severity: "error",
				message: "moduleSpecifier ends with '.d.ts'",
				id: "impreciseModuleSpecifier"
			})
		}
	}

	for (const {message} of toolchain.tsTypeCheckModule(mod)) {
		messages.push({
			severity: "error",
			message,
			id: undefined
		})
	}

	return messages
}

export function lintFactory(context: APIContext) {
	return impl!.bind(context)
}
