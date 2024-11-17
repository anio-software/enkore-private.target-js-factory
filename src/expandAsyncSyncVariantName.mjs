export function getType(name) {
	if (name.endsWith(".as.d.mts")) return "d.mts"
	if (name.endsWith(".as.mts")) return "mts"

	return null
}

export function expandAsyncSyncVariantName(name) {
	const type = getType(name)

	if (type === null || !name.includes("XXX")) {
		throw new Error(
			`expandAsyncSyncVariantName: unexpandable name '${name}'.`
		)
	}

	const offset = `.as.${type}`.length

	const tmp = name.slice(0, -offset).split("XXX")

	if (tmp.length > 3) {
		throw new Error(
			`expandAsyncSyncVariantName: ambiguous expansion '${name}'.`
		)
	}

	const sync_name = tmp.join("Sync")
	const async_name = tmp.join("")

	return [async_name, sync_name]
}
