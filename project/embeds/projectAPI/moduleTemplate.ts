//
// using a template like this allows rollup to treeshake the functions
// this is not possible with a factory function:
//
// const api = factory(context)
// export const myMethod = api.myMethod
//
// 'myMethod' will always be present in the output bundle, regardless of whether it's been used or not
//
import type {
	EnkoreJSRuntimeProjectAPIContext,
	EnkoreTargetJSProjectAPI as API
} from "@anio-software/enkore-private.spec"

import {
	getEmbedData,
	getGlobalState,
	translateEmbedURLToGlobalIdentifier
} from "js-runtime-helpers/v0"

function __getContext(): any {
	return "%%CONTEXT_DATA%%"
}

const isNode: boolean = ("%%IS_NODE%%" as string) === "yes"
const context: EnkoreJSRuntimeProjectAPIContext = __getContext()

if (isNode && !context._projectEmbedFileMapRemoveMeInBundle) {
	throw new Error(`_projectEmbedFileMapRemoveMeInBundle must be set in node context.`)
} else if (!isNode && context._projectEmbedFileMapRemoveMeInBundle) {
	throw new Error(`_projectEmbedFileMapRemoveMeInBundle must be undefined in bundle context.`)
}

export const apiID: API["apiID"] = "EnkoreTargetJSProjectAPI"
export const apiMajorVersion: API["apiMajorVersion"] = 0
export const apiRevision: API["apiRevision"] = 0

export const getProject: API["getProject"] = function() {
	return context.project
}

export const getProjectId: API["getProjectId"] = function() {
	return context.project.projectId
}

export const getEnkoreConfiguration: API["getEnkoreConfiguration"] = function() {
	return context.project.enkoreConfiguration
}

export const getProjectPackageJSON: API["getProjectPackageJSON"] = function() {
	return JSON.parse(JSON.stringify(context.project.packageJSON))
}

// --- //

function base64ToUint8Array(str: string): Uint8Array {
	// from https://web.dev/articles/base64-encoding
	const binString = globalThis.atob(str)

	return Uint8Array.from(binString, (m) => m.codePointAt(0)!)
}

export const getEmbedAsString: API["getEmbedAsString"] = function(embedURL) {
	if (isNode) {
		const map = context._projectEmbedFileMapRemoveMeInBundle!

		if (!map.has(embedURL)) {
			throw new Error(`Unable to find embed '${embedURL}' in embed map.`)
		}

		return (new TextDecoder).decode(base64ToUint8Array(map.get(embedURL)!.data))
	}

	return (new TextDecoder).decode(getEmbedData(context, embedURL))
}

export const getEmbedAsUint8Array: API["getEmbedAsUint8Array"] = function(embedURL) {
	if (isNode) {
		const map = context._projectEmbedFileMapRemoveMeInBundle!

		if (!map.has(embedURL)) {
			throw new Error(`Unable to find embed '${embedURL}' in embed map.`)
		}

		return base64ToUint8Array(map.get(embedURL)!.data)
	}

	return getEmbedData(context, embedURL)
}

export const getEmbedAsURL: API["getEmbedAsURL"] = function(embedURL) {
	if (isNode) {
		const map = context._projectEmbedFileMapRemoveMeInBundle!

		if (!map.has(embedURL)) {
			throw new Error(`Unable to find embed '${embedURL}' in embed map.`)
		}

		return map.get(embedURL)!._resourceURL
	}

	const globalIdentifier = translateEmbedURLToGlobalIdentifier(context, embedURL)
	const globalState = getGlobalState()

	if (!globalState.mutable.embedResourceURLs.has(globalIdentifier)) {
		throw new Error(`Unable to get resource URL for embed '${globalIdentifier}'.`)
	}

	return globalState.mutable.embedResourceURLs.get(globalIdentifier)!
}
