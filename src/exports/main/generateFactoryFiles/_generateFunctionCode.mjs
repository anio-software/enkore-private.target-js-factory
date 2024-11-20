import path from "node:path"

export function _generateFunctionCode(
	factory_path,
	factory_name,
	implementation_path,
	export_name
) {
	return `
import {${factory_name} as factory} from ${JSON.stringify(path.normalize(factory_path))}
import type {Signature} from ${JSON.stringify(path.normalize(implementation_path))}

export const ${export_name} : Signature = factory()
`.slice(1)
}
