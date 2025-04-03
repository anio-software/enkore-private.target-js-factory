import {_expandAsyncSyncVariantSourceCodeFromString} from "./_expandAsyncSyncVariantSourceCodeFromString.mts"

export function expandAsyncSyncVariantSourceCode(
	code: string,
	variant: "async"|"sync",
	fileName?: string
): string {
	return _expandAsyncSyncVariantSourceCodeFromString(code, variant, fileName)
}
