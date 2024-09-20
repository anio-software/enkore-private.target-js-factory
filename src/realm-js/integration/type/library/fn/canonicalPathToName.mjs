//
// Returns the canonical name for a canonical path
// this simply means replacing slashes with a $
// and dots to underscores
//
export default function(canonical_path) {
	let fn_name = canonical_path

	fn_name = fn_name.split("/").join("$")
	fn_name = fn_name.split(".").join("_")

	return fn_name
}
