import path from "node:path"

// this function only requires
// that "XXX" is present in "name"
export function isExpandableName(
	name
) {
	return name.includes("XXX")
}

export function isExpandableFileName(
	file_path
) {
	const file_name = path.basename(file_path)

	if (!file_name.startsWith("__")) return false
	if (!isExpandableName(file_name)) return false

	if (file_name.endsWith(".as.d.mts")) return true
	if (file_name.endsWith(".as.mts")) return true

	return false
}

export function expandAsyncSyncVariantName(
	name
) {
	if (!isExpandableFileName(name)) {
		throw new Error(
			`expandAsyncSyncVariantName: unexpandable name '${name}'.`
		)
	}

	const type = name.endsWith(".as.d.mts") ? "d.mts" : "mts"

	const offset = `.as.${type}`.length

	const tmp = name.slice(0, -offset).split("XXX")

	if (tmp.length > 3) {
		throw new Error(
			`expandAsyncSyncVariantName: ambiguous expansion '${name}'.`
		)
	}

	const sync_name = tmp.join("Sync").slice(2)
	const async_name = tmp.join("").slice(2)

	return [async_name, sync_name]
}
