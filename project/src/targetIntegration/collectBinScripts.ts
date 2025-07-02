import type {
	EnkoreSessionAPI
} from "@anio-software/enkore-private.spec"

export function collectBinScripts(session: EnkoreSessionAPI): string[] {
	const binProjectFiles = session.enkore.getAllProjectFiles("bin")
	const scripts: string[] = []

	for (const {fileName} of binProjectFiles) {
		if (!fileName.endsWith(".ts")) continue

		scripts.push(fileName.slice(0, -3))
	}

	return scripts
}
