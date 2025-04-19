import type {EnkoreSessionAPI} from "@enkore/spec"
import {getTargetDependency} from "./getTargetDependency.mts"

export function getGlobalRuntimeDataInitCode(
	session: EnkoreSessionAPI,
	globalData: Record<string, unknown>
): string {
	const babel = getTargetDependency(session, "@enkore/babel")

	const {
		defineGlobalData
	} = babel.getAndRemoveEnkoreJSRuntimeGlobalDataStringFromCode("")

	return defineGlobalData(globalData)
}
