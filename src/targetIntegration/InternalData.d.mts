import type {MyTSProgram, MyTSExport} from "@anio-software/enkore-private.target-js-toolchain_types"
import type {RequestedEmbedsFromCodeResult} from "@anio-software/enkore-private.target-js-toolchain_types"
import type {EnkoreTargetJSOptions} from "@anio-software/enkore-private.spec"

type ArrayType<T> = T extends any[] ? T : never

export type PublishConfig = Required<
	ArrayType<NonNullable<EnkoreTargetJSOptions["publish"]>>[number]
>

export type Registry = NonNullable<EnkoreTargetJSOptions["registry"]>[string]

export type Export = {
	name: string
	descriptor: MyTSExport
	relativePath: string
	pathToJsFile: string
	pathToDtsFile: string
	isTSXComponent: boolean
	importedCSSFiles: string[]
}

export type NPMPackage = {
	name: string
	version: string
	packageContents: PublishConfig["packageContents"]
	publishConfig: Omit<PublishConfig, "packageName" | "packageContents">
}

export type InternalData = {
	projectId: string
	myTSProgram: MyTSProgram
	entryPointMap: Map<string, Map<string, Export>>
	externalCSSFiles: string[]

	// cache calls to getRequestedEmbedsFromCode()
	requestedEmbedsFileCache: Map<string, RequestedEmbedsFromCodeResult>

	registryMap: Map<string, Registry>
	npmPackages: NPMPackage[]
}
