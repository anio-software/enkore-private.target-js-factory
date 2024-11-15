export function expandAsyncSyncVariantName(name) {
	if (!name.endsWith(".as.mts")) {
		return name
	}

	// todo: check if "XXX" is in the name

	const sync_name = name.slice(0, -7).split("XXX").join("Sync")
	const async_name = name.slice(0, -7).split("XXX").join("")

	return [async_name, sync_name]
}
