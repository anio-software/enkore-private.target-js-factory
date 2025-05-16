import type {EnkoreConfig} from "@asint/enkore__spec"
import type {NodePackageJSON} from "@asint/enkore__spec/primitives"
import type {EnkoreJSRuntimeProject} from "@asint/enkore__spec"

export type ProjectEmbedFile = {
	sourceFilePath: string
	data: string
}

export type ProjectAPIContext = {
	// pre-computed here so we don't have to import "@enkore/spec"
	// which leads to inclusion of node-specific modules
	// (because of disabled treeshaking?)
	project: EnkoreJSRuntimeProject
	projectId: string
	projectConfig: EnkoreConfig
	projectPackageJSON: NodePackageJSON
	projectEmbedFileTranslationMap: Record<string, string>
	_projectEmbedFileMapRemoveMeInBundle?: Map<string, ProjectEmbedFile>
}
