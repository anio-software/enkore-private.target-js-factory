import {fileURLToPath} from "node:url"
import path from "node:path"
import {createRequire} from "node:module"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(__filename)

export default function() {
	return async function(id) {
		if (
			id === `@4tune/realm-js` ||
			id === `@4tune/realm-web`
		) {
			// this signals that Rollup should not ask other plugins or check
			// the file system to find this id
			return `\0${id}`
		}

		if (id === `@4tune/js-runtime`) {
			return require.resolve("@4tune/js-and-web-runtime")
		}

		return null // other ids should be handled as usually
	}
}
