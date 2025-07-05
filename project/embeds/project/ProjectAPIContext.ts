import type {EnkoreConfig} from "@anio-software/enkore-private.spec"
import type {NodePackageJSON} from "@anio-software/enkore-private.spec/primitives"
import type {EnkoreJSRuntimeProject} from "@anio-software/enkore-private.spec"

export type ProjectEmbedFile = {
	sourceFilePath: string
	data: string
}

export type ProjectAPIContext = {
	// pre-computed here so we don't have to import "@anio-software/enkore-private.spec"
	// which leads to inclusion of node-specific modules
	// (because of disabled treeshaking?)
	project: EnkoreJSRuntimeProject
	projectId: string
	projectConfig: EnkoreConfig
	projectPackageJSON: NodePackageJSON
	projectEmbedFileTranslationMap: Record<string, string>
	_projectEmbedFileMapRemoveMeInBundle?: Map<string, ProjectEmbedFile>
}
