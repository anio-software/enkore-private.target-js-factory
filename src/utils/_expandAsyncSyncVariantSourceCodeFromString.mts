import path from "node:path"
import {expandAsyncSyncVariantFilePath} from "./expandAsyncSyncVariantFilePath.mts"

export function _expandAsyncSyncVariantSourceCodeFromString(
	source: string,
	variant: "async" | "sync",
	sourceFilePath?: string
): string {
	const lines = source.toString().split("\n")

	let output = []

	for (let i = 0; i < lines.length; ++i) {
		const line = lines[i]
		const nextLine = (lines.length > (i + 1)) ? lines[i + 1] : null

		if (nextLine === null) {
			output.push(line)

			continue
		}

		if (!line.startsWith("//") && nextLine.startsWith("//>")) {
			output.push(
				variant === "sync" ? nextLine.slice(3) : line
			)
			++i

			continue
		}

		output.push(line)
	}

	if (!sourceFilePath) {
		return output.join("\n")
	}

	//
	// replace __XX__ with the expanded file name (minus the extension)
	//
	const [
		asyncFilePath,
		syncFilePath
	] = expandAsyncSyncVariantFilePath(sourceFilePath)

	const fileName = path.basename(
		variant === "async" ? asyncFilePath : syncFilePath
	).slice(0, -(`.as.mts`.length))

	return output.join("\n").split("__XX__").join(fileName)
}
