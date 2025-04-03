import fs from "node:fs"

import {_expandAsyncSyncVariantSourceCodeFromString} from "./_expandAsyncSyncVariantSourceCodeFromString.mts"

export function expandAsyncSyncVariantSourceFile(
	sourcePath: string,
	variant: "async" | "sync"
): string {
	const contents = fs.readFileSync(sourcePath).toString()

	return _expandAsyncSyncVariantSourceCodeFromString(
		contents, variant, sourcePath
	)
}
