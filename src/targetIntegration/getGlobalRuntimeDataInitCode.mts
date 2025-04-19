import type {EnkoreSessionAPI} from "@enkore/spec"
import {getTargetDependency} from "./getTargetDependency.mts"
import type {EnkoreJSRuntimeGlobalData} from "@enkore/spec"

export function getGlobalRuntimeDataInitCode(
	session: EnkoreSessionAPI,
	globalData: EnkoreJSRuntimeGlobalData
): string {
	const babel = getTargetDependency(session, "@enkore/babel")

	const {
		defineGlobalData
	} = babel.getAndRemoveEnkoreJSRuntimeGlobalDataStringFromCode("")

	return defineGlobalData(globalData)
}
