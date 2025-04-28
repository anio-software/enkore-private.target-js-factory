import type {EnkoreSessionAPI} from "@enkore/spec"
import type {MyTSModule} from "@enkore-types/target-js-toolchain"
import {getTargetDependency} from "./getTargetDependency.mts"

export function getTypeScriptDefinition(
	session: EnkoreSessionAPI, mod: MyTSModule
): string {
	const nodeMyTS = getTargetDependency(session, "@enkore/typescript")

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
