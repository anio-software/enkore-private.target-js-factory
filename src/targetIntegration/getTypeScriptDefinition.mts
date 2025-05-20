import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {MyTSModule} from "@anio-software/enkore-types.target-js-toolchain"

export function getTypeScriptDefinition(
	session: EnkoreSessionAPI, mod: MyTSModule
): string {
	const toolchain = session.target._getToolchain("js")

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
