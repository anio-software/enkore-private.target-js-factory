import createTemporaryResource from "@anio-js-foundation/create-temporary-resource"
import parseResourceURL from "../parseResourceURL.mjs"

function loadResourceAsURL(map, type, path, data) {
	const full_path = `${type}://${path}`

	if (map.has(full_path)) {
		return map.get(full_path)
	}

	const {location} = createTemporaryResource(data, {
		type: type === "esmodule" ? "text/javascript" : "text/plain"
	})

	map.set(full_path, location)

	return location
}

export default function(runtime, url, as_url = false) {
	if (url === null) return

	if (runtime.resources === null) {
		throw new Error(
			`Runtime resources have not been loaded yet.\n` +
			`In order to load them import {loadResource} from "@fourtune/realm-<<REALM>>" and call loadResource(null)` +
			` to load resources.`
		)
	}

	const {type, path} = parseResourceURL(url)

	for (const resource of runtime.resources) {
		if (resource.type !== type) continue
		if (resource.path !== path) continue

		if (!as_url) return resource.data

		return loadResourceAsURL(
			runtime.resources_url,
			type,
			path,
			resource.data
		)
	}

	throw new Error(`Unable to locate resource ${type}://${path}.`)
}
