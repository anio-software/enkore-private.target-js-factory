import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {MyTSModule} from "@anio-software/enkore-private.target-js-toolchain_types"

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
					if (moduleSpecifier.endsWith(".d.ts")) {
						return undefined
					}

					if (moduleSpecifier.endsWith(".ts")) {
						if (decl.isTypeOnly) {
							return moduleSpecifier.slice(0, -3) + ".d.ts"
						} else {
							return moduleSpecifier.slice(0, -3) + ".js"
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
