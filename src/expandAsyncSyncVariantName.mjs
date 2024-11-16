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

	const sync_name = name.slice(0, -offset).split("XXX").join("Sync")
	const async_name = name.slice(0, -offset).split("XXX").join("")

	return [async_name, sync_name]
}
