import normalizePath from "./normalizePath.mjs"

function resourceURLType(url) {
	if (url.startsWith("text://")) {
		return "text"
	} else if (url.startsWith("blob://")) {
		return "blob"
	} else if (url.startsWith("esmodule://")) {
		return "esmodule"
	}

	throw new Error(`Invalid resource url '${url}'.`)
}

export default function(url) {
	const type = resourceURLType(url)
	const relative_url = url.slice(`${type}://`.length)

	return {type, path: normalizePath(relative_url)}
}
