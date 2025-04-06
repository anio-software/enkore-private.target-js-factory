import {
	type EnkoreJSRuntimeContext,
	type EnkoreJSRuntimeContextOptions,
	createEntity
} from "@enkore/spec"
import type {RuntimeAPIContext} from "./RuntimeAPIContext.d.mts"

export function createRuntimeContext(
	runtimeContext: RuntimeAPIContext,
	options: EnkoreJSRuntimeContextOptions | undefined,
): EnkoreJSRuntimeContext {
	return createEntity("EnkoreJSRuntimeContext", 0, 0, {
		__internalDoNotUse: {
			originPackage: {} as any
		},
		log: {} as any,
		options: {} as any,
		project: {
			enkoreConfiguration: runtimeContext.projectConfig,
			packageJSON: runtimeContext.projectPackageJSON
		}
	})
}
