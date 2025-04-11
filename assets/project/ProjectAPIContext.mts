import type {EnkoreConfig} from "@enkore/spec"
import type {NodePackageJSON} from "@enkore/spec/primitives"

export type ProjectAPIContext = {
	projectConfig: EnkoreConfig
	projectPackageJSON: NodePackageJSON
}
