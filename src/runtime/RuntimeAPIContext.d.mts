import type {EnkoreConfig} from "@enkore/spec"
import type {NodePackageJSON} from "@enkore/spec/primitives"

export type RuntimeAPIContext = {
	projectRoot: string
	projectConfig: EnkoreConfig
	projectPackageJSON: NodePackageJSON
}
