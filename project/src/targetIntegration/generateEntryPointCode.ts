import type {EntryPoint} from "./InternalData.ts"

export function generateEntryPointCode(
	entryPoint: EntryPoint,
	kind: "js" | "dts" | "css"
): string {
	let code = ``

	if (kind === "js") {
		for (const [exportName, meta] of entryPoint.exports.entries()) {
			if (meta.descriptor.isTypeOrTypeLike) continue

			code += `export {${exportName}} from "./${meta.pathToJsFile}"\n`
		}
	} else if (kind === "dts") {
		for (const [exportName, meta] of entryPoint.exports.entries()) {
			if (meta.descriptor.isTypeOrTypeLike) {
				code += `export type {${exportName}} from "./${meta.pathToDtsFile}"\n`
			} else {
				code += `export {${exportName}} from "./${meta.pathToJsFile}"\n`
			}
		}
	} else if (kind === "css") {
		const includedCSSFilePaths: Map<string, 0> = new Map()

		for (const [exportName, meta] of entryPoint.exports.entries()) {
			for (const [cssFilePath] of meta.cssImportMap.entries()) {
				const normalizedPath: string = (() => {
					if (cssFilePath.startsWith("/")) {
						return cssFilePath
					}

					return `./build/${cssFilePath}`
				})()

				if (!includedCSSFilePaths.has(normalizedPath)) {
					code += `@import ${JSON.stringify(normalizedPath)};\n`
				}

				includedCSSFilePaths.set(normalizedPath, 0)
			}
		}
	}

	return code
}
