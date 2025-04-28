import type {EnkoreSessionAPI} from "@enkore/spec"
import type {APIContext} from "./APIContext.mts"
import type {InternalData} from "./InternalData.d.mts"
import type {RequestedEmbedsFromCodeReasonWhyUnknown} from "@enkore-types/target-js-toolchain"
import {getInternalData} from "./getInternalData.mts"
import {getModuleGuarded} from "./getModuleGuarded.mts"
import {getTargetDependency} from "./getTargetDependency.mts"
import {getProjectAPIMethodNames} from "#~synthetic/user/export/project/getProjectAPIMethodNames.mts"
import {readFileString} from "@aniojs/node-fs"
import path from "node:path"

type MapValueType<A> = A extends Map<any, infer V> ? V : never;

type RequestedEmbeds = {
	result: "all"
	reasonsWhy: RequestedEmbedsFromCodeReasonWhyUnknown[]
} | {
	result: "specific"
	usedEmbeds: Map<string, {
		requestedByMethods: string[]
	}>
}

export async function getRequestedEmbeds(
	session: EnkoreSessionAPI,
	apiContext: APIContext,
	exportMap: MapValueType<InternalData["entryPointMap"]>
): Promise<RequestedEmbeds> {
	const reasonsWhy: RequestedEmbedsFromCodeReasonWhyUnknown[] = []
	const usedEmbeds: Map<string, {requestedByMethods: string[]}> = new Map()

	const enkoreProjectModuleSpecifiers = [
		`@enkore-target/${apiContext.target}/project`
	]

	const enkoreProjectModuleGetEmbedProperties = getProjectAPIMethodNames().filter(x => {
		return x.toLowerCase().includes("embed")
	})

	const babel = getTargetDependency(session, "@enkore/target-js-toolchain")
	const filesToAnalyze: Map<string, true> = new Map()

	for (const [_, {relativePath}] of exportMap.entries()) {
		const mod = getModuleGuarded(
			getInternalData(session).myTSProgram,
			`build/${relativePath}`
		)

		for (const file of mod.moduleFileDependencyTree.convertToArray()) {
			filesToAnalyze.set(file, true)
		}

		filesToAnalyze.set(mod.filePath, true)
	}

	for (const [filePath] of filesToAnalyze.entries()) {
		const code = await readFileString(
			path.join(session.project.root, filePath)
		)

		const jsCode = babel.stripTypeScriptTypes(code, {
			rewriteImportExtensions: true
		})

		const requestedEmbedsResult = await babel.getRequestedEmbedsFromCode(
			enkoreProjectModuleSpecifiers,
			enkoreProjectModuleGetEmbedProperties,
			jsCode
		)

		if (requestedEmbedsResult.codeRequestsEmbeds === false) {
			continue
		}

		if (requestedEmbedsResult.requestedEmbeds === "unknown") {
			const {reasonWhyUnknown} = requestedEmbedsResult

			if (!reasonsWhy.includes(reasonWhyUnknown)) {
				reasonsWhy.push(reasonWhyUnknown)
			}

			continue
		}

		for (const {embedPath, requestedByMethod} of requestedEmbedsResult.requestedEmbeds) {
			if (!usedEmbeds.has(embedPath)) {
				usedEmbeds.set(embedPath, {
					requestedByMethods: []
				})
			}

			const {requestedByMethods} = usedEmbeds.get(embedPath)!

			if (!requestedByMethods.includes(requestedByMethod)) {
				requestedByMethods.push(requestedByMethod)
			}
		}
	}

	if (reasonsWhy.length) {
		return {
			result: "all",
			reasonsWhy
		}
	}

	return {
		result: "specific",
		usedEmbeds
	}
}
