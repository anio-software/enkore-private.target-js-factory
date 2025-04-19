import type {EnkoreConfig} from "@enkore/spec"
import type {NodePackageJSON} from "@enkore/spec/primitives"

export type ProjectEmbedFile = {
	sourceFilePath: string
	data: string
}

export type ProjectAPIContext = {
	projectId: string
	projectConfig: EnkoreConfig
	projectPackageJSON: NodePackageJSON
	_projectEmbedFileMapRemoveMeInBundle: Record<string, ProjectEmbedFile>
}
