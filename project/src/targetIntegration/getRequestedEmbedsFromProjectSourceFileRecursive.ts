import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec";
import type {APIContext} from "./APIContext.ts";
import type {RequestedEmbedsFromCodeResult} from "@anio-software/enkore-private.target-js-toolchain_types"
import {getRequestedEmbedsFromProjectSourceFile} from "./getRequestedEmbedsFromProjectSourceFile.ts"
import {getModuleGuarded} from "./getModuleGuarded.ts"
import {getInternalData} from "./getInternalData.ts"

type Ret = RequestedEmbedsFromCodeResult[]

export async function getRequestedEmbedsFromProjectSourceFileRecursive(
	apiContext: APIContext,
	session: EnkoreSessionAPI,
	sourceFilePath: string
): Promise<Ret> {
	const ret: Ret = []

	const mod = getModuleGuarded(
		getInternalData(session).myTSProgram,
		`build/${sourceFilePath}`
	)

	const filesToAnalyze: Set<string> = new Set()

	for (const moduleSpecifier of mod.referencedModuleSpecifiers) {
		if (moduleSpecifier.startsWith("build/")) {
			filesToAnalyze.add(moduleSpecifier.slice("build/".length))
		}
	}

	filesToAnalyze.add(mod.filePath.slice("build/".length))

	for (const [filePath] of filesToAnalyze.entries()) {
		ret.push(
			await getRequestedEmbedsFromProjectSourceFile(
				apiContext, session, filePath
			)
		)
	}

	return ret
}
