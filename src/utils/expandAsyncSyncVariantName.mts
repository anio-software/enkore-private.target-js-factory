import {isAsyncSyncExpandableName} from "./isAsyncSyncExpandableName.mts"

export function expandAsyncSyncVariantName(
	name: string
): [string, string] {
	if (!isAsyncSyncExpandableName(name)) {
		throw new Error(
			`expandAsyncSyncVariantName: unexpandable name '${name}'.`
		)
	}

	const tmp = name.split("XXX")

	if (tmp.length > 3) {
		throw new Error(
			`expandAsyncSyncVariantName: ambiguous expansion '${name}'.`
		)
	}

	const syncName = tmp.join("Sync")
	const asyncName = tmp.join("")

	return [asyncName, syncName]
}
