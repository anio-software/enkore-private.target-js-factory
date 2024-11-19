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

export function expandAsyncSyncVariantNew(
	name
) {
	if (!isExpandableName(name)) {
		throw new Error(
			`expandAsyncSyncVariantNew: unexpandable name '${name}'.`
		)
	}

	const tmp = name.split("XXX")

	if (tmp.length > 3) {
		throw new Error(
			`expandAsyncSyncVariantNew: ambiguous expansion '${name}'.`
		)
	}

	const sync_name = tmp.join("Sync")
	const async_name = tmp.join("")

	return [async_name, sync_name]
}

export function expandAsyncSyncVariantFilePath(
	file_path
) {
	if (!isExpandableFileName(file_path)) {
		throw new Error(
			`expandAsyncSyncVariantFilePath: unexpandable name '${file_path}'.`
		)
	}

	const base_dir = path.dirname(file_path)

	// remove __
	let file_name = path.basename(file_path).slice(2)
	const type = file_name.endsWith(".as.d.mts") ? "d.mts" : "mts"

	// remove extension
	file_name = file_name.slice(0, -(`.as.${type}`.length))

	const [async_file_name, sync_file_name] = expandAsyncSyncVariantNew(file_name)

	return [
		path.join(base_dir, `${async_file_name}.${type}`),
		path.join(base_dir, `${sync_file_name}.${type}`)
	]
}
