import path from "node:path"
import {isAsyncSyncExpandableName} from "./isAsyncSyncExpandableName.mts"

export function isAsyncSyncExpandableFilePath(filePath: string): boolean {
	const fileName = path.basename(filePath)

	if (!fileName.startsWith("__")) return false
	if (!isAsyncSyncExpandableName(fileName)) return false

	if (fileName.endsWith(".as.mts")) return true

	return false
}
