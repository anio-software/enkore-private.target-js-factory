import path from "node:path"

export function _generateFunctionCode(
	factory_path,
	implementation_path,
	export_name
) {
	const factory_name = path.basename(factory_path).slice(0, -4)

	return `
import {${factory_name} as factory, type Signature} from ${JSON.stringify(path.normalize(factory_path))}

export const ${export_name} : Signature = factory()
`.slice(1)
}
