import type {
	EnkoreSessionAPI
} from "@anio-software/enkore-private.spec"

export function collectCSSFiles(session: EnkoreSessionAPI): string[] {
	// don't collect files if we are building embeds only
	if (session.enkore.getOptions()._partialBuild === true) {
		session.enkore.emitMessage(
			`debug`, `returning empty entryPointMap.`
		)

		return []
	}

	const files: string[] = []

	for (const file of session.enkore.getProjectFiles("src")) {
		if (!file.fileName.endsWith(".css")) continue

		files.push(file.relativePath)
	}

	return files
}
