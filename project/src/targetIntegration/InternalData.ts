import type {MyTSProgram, MyTSExport} from "@anio-software/enkore-private.target-js-toolchain_types"
import type {RequestedEmbedsFromCodeResult} from "@anio-software/enkore-private.target-js-toolchain_types"
import type {
	CommonTargetJSOptions,
	EnkoreJSBuildManifestFile,
	EnkoreJSRuntimeProjectAPIContext
} from "@anio-software/enkore-private.spec"

type ArrayType<T> = T extends any[] ? T : never

export type PublishConfig = Required<
	ArrayType<NonNullable<CommonTargetJSOptions["publish"]>>[number]
>

export type Registry = NonNullable<CommonTargetJSOptions["registry"]>[string]

export type Export = {
	name: string
	descriptor: MyTSExport
	relativePath: string
	pathToJsFile: string
	pathToDtsFile: string
	isTSXComponent: boolean
	cssImportMap: Map<string, 0>
}

export type NPMPackage = {
	name: string
	version: string
	packageContents: PublishConfig["packageContents"]
	publishConfig: Omit<PublishConfig, "packageName" | "packageContents">
}

export type EmbedsMap = Map<string, {
	size: number
	createResourceAtRuntimeInit: boolean
}>

export type RemoteEmbed = EnkoreJSBuildManifestFile["exports"][string]["embeds"][string] & {
	absoluteSourceFilePath: string
}

export type EntryPoint = {
	hasCSSImports: boolean
	exports: Map<string, Export>
	localEmbeds: EmbedsMap | "none"
	remoteEmbeds: Map<string, RemoteEmbed>
}

export type InternalData = {
	projectId: string
	myTSProgram: MyTSProgram
	entryPoints: Map<string, EntryPoint>
	binScripts: string[]

	// cache calls to getRequestedEmbedsFromCode()
	requestedEmbedsFileCache: Map<string, RequestedEmbedsFromCodeResult>

	registryMap: Map<string, Registry>
	npmPackages: NPMPackage[]

	projectAPIContext: EnkoreJSRuntimeProjectAPIContext|null

	// remove me in the future
	_backwardsCompatPostCompileHook: {
		needsManualInvocation: boolean
		hasBeenManuallyInvoked: boolean
	}
}
