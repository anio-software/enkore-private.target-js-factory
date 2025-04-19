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
	projectEmbedFileTranslationMap: Record<string, string>
	_projectEmbedFileMapRemoveMeInBundle: Map<string, ProjectEmbedFile>
}
