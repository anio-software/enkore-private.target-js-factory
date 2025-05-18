import type {MyTSProgram, MyTSExport} from "@enkore-types/target-js-toolchain"
import type {RequestedEmbedsFromCodeResult} from "@enkore-types/target-js-toolchain"
import type {TargetOptions} from "./TargetOptions.d.mts"

export type Registry = Required<
	NonNullable<TargetOptions["registry"]>[string]
>

export type Export = {
	name: string
	descriptor: MyTSExport
	relativePath: string
	pathToJsFile: string
	pathToDtsFile: string
}

export type NPMPackage = {
	name: string
	publishWithProvenance: boolean
}

export type InternalData = {
	projectId: string
	myTSProgram: MyTSProgram
	entryPointMap: Map<string, Map<string, Export>>

	// cache calls to getRequestedEmbedsFromCode()
	requestedEmbedsFileCache: Map<string, RequestedEmbedsFromCodeResult>

	registryMap: Map<string, Registry>
	npmPackages: NPMPackage[]
	npmTypesPackages: NPMPackage[]
}
