import type {MyTSProgram, MyTSExport} from "@anio-software/enkore-private.target-js-toolchain_types"
import type {RequestedEmbedsFromCodeResult} from "@anio-software/enkore-private.target-js-toolchain_types"
import type {CommonTargetJSOptions} from "@anio-software/enkore-private.spec"

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
	createResourceAtRuntimeInit: boolean
}>

export type EntryPoint = {
	hasCSSImports: boolean
	exports: Map<string, Export>
	embeds: EmbedsMap | "none"
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
}
