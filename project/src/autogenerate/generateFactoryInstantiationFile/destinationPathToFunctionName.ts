import path from "node:path"

export function destinationPathToFunctionName(destinationPath: string): string {
	const basename = path.basename(destinationPath)

	if (basename.endsWith(".as.ts")) {
		return basename.slice(0, -(".as.ts".length))
	}

	return basename.slice(0, -(".ts".length))
}
