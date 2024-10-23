import {fileURLToPath} from "node:url"
import path from "node:path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default function() {
	return async function(id) {
		if (
			id === `@fourtune/realm-js/api` ||
			id === `@fourtune/realm-web/api`
		) {
			// this signals that Rollup should not ask other plugins or check
			// the file system to find this id
			return `\0${id}`
		}

		//
		// the runtime implementation is next to the
		// plugin.mjs file
		//
		if (id === `@fourtune/js-runtime`) {
			return path.join(__dirname, "runtime.mjs")
		}

		return null // other ids should be handled as usually
	}
}
