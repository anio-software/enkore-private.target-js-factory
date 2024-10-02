export default function(val) {
	if (!("_version" in val)) {
		return false
	}

	if (!("instance" in val)) {
		return false
	}

	return true
}
