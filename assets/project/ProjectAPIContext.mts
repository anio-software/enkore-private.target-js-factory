import type {EnkoreConfig} from "@anio-software/enkore.spec"
import type {NodePackageJSON} from "@anio-software/enkore.spec/primitives"
import type {EnkoreJSRuntimeProject} from "@anio-software/enkore.spec"

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
