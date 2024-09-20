import stripSuffix from "@anio-js-foundation/strip-suffix"

export default function(relative_path) {
	if (relative_path.endsWith("Factory.mjs")) {
		return stripSuffix(relative_path, "Factory.mjs")
	} else if (relative_path.endsWith(".mjs")) {
		return stripSuffix(relative_path, ".mjs")
	}
}
