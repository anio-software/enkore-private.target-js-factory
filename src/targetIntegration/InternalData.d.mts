import type {MyTSProgram, MyTSExport} from "@anio-software/enkore-types.target-js-toolchain"
import type {RequestedEmbedsFromCodeResult} from "@anio-software/enkore-types.target-js-toolchain"
import type {TargetOptions} from "./TargetOptions.d.mts"

type ArrayType<T> = T extends any[] ? T : never

export type PublishConfig = Required<
	ArrayType<NonNullable<TargetOptions["publish"]>>[number]
>

export type Registry = NonNullable<TargetOptions["registry"]>[string]

export type Export = {
	name: string
	descriptor: MyTSExport
	relativePath: string
	pathToJsFile: string
	pathToDtsFile: string
}

export type NPMPackage = {
	name: string
	packageContents: PublishConfig["packageContents"]
	publishConfig: Omit<PublishConfig, "packageName" | "packageContents">
}

export type InternalData = {
	projectId: string
	myTSProgram: MyTSProgram
	entryPointMap: Map<string, Map<string, Export>>

	// cache calls to getRequestedEmbedsFromCode()
	requestedEmbedsFileCache: Map<string, RequestedEmbedsFromCodeResult>

	registryMap: Map<string, Registry>
	npmPackages: NPMPackage[]
}
