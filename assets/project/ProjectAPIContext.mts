import type {EnkoreConfig} from "@enkore/spec"
import type {NodePackageJSON} from "@enkore/spec/primitives"

export type ProjectEmbedFile = {
	sourceFilePath: string
	data: string
}

export type ProjectAPIContext = {
	projectConfig: EnkoreConfig
	projectPackageJSON: NodePackageJSON
	projectEmbedFileMap: Record<string, ProjectEmbedFile>
}
