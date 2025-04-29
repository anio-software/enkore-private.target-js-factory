import type {EnkoreSessionAPI} from "@enkore/spec"
import type {MyTSModule} from "@enkore-types/target-js-toolchain"
import {getTargetDependency} from "./getTargetDependency.mts"

export function getTypeScriptDefinition(
	session: EnkoreSessionAPI, mod: MyTSModule
): string {
	const toolchain = getTargetDependency(session, "@enkore/target-js-toolchain")

	const {declarations,diagnosticMessages} = toolchain.tsGenerateDeclarationsForModule(
		mod, (ctx) => {
			return [
				toolchain.tsExpandModuleImportAndExportDeclarations(ctx),
				// fix imports
				toolchain.tsRemapModuleImportAndExportSpecifiers(ctx, (moduleSpecifier, decl) => {
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
