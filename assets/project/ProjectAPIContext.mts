import type {EnkoreConfig} from "@enkore/spec"
import type {NodePackageJSON} from "@enkore/spec/primitives"
import type {EnkoreJSRuntimeProject} from "@enkore/spec"

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
