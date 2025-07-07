import type {API} from "#~src/targetIntegration/API.ts"
import type {APIContext} from "#~src/targetIntegration/APIContext.ts"
import {getInternalData} from "#~src/targetIntegration/getInternalData.ts"
import {isString, isNumber} from "@anio-software/pkg.is"
import {getToolchain} from "#~src/getToolchain.ts"

const impl: API["hook"]["preLint"] = async function(
	this: APIContext, session
) {
	const toolchain = getToolchain(session)
	const myProgram = getInternalData(session).myTSProgram

	const targetOptions = session.target.getOptions(this.target)
	const {entryPoints} = getInternalData(session)

	if (targetOptions.exports) {
		for (const exportPath in targetOptions.exports) {
			const exp = targetOptions.exports[exportPath]

			if (!exp.checkAgainstInterface) continue
			if (!exp.checkAgainstInterface) continue

			const [interfaceSource, interfaceName] = exp.checkAgainstInterface

			if (!entryPoints.has(exportPath)) {
				session.enkore.emitMessage(
					`error`,
					`no such export path '${exportPath}'`
				)

				continue
			}

			const entryPoint = entryPoints.get(exportPath)!

			let testCodeImports = ``, testCode = ``

			testCodeImports += `import type {${interfaceName} as __InterfaceToTestAgainst} from "${interfaceSource}"\n`
			testCode += `const exportObject: __InterfaceToTestAgainst = {\n`

			for (const [exportName, meta] of entryPoint.exports) {
				if (meta.descriptor.kind === "type") continue

				testCodeImports += `import {${exportName}} from "../${meta.relativePath}"\n`

				testCode += `    ${exportName},\n`
			}

			testCode += `}\n`

			const vFile = toolchain.tsDefineVirtualProgramFile(
				`project/src/testInterfaceCode.ts`, `${testCodeImports}\n${testCode}`
			)

			const {program: testProg} = toolchain.tsCreateProgram(
				session.project.root,
				[vFile],
				getInternalData(session).myTSProgram.compilerOptions
			)

			const diagnosticMessages = toolchain.tsTypeCheckModule(
				testProg.getModule(vFile.path)!, true
			)

			for (const {code, message} of diagnosticMessages) {
				session.enkore.emitMessage(
					"error",
					`checkAgainstInterface: ts(${code}) ${message}`
				)
			}

			if (!diagnosticMessages.length) {
				session.enkore.emitMessage(
					`info`, `export '${exportPath}' type checks against interface '${interfaceName}' from '${interfaceSource}'`
				)
			}
		}
	}

	if (session.enkore.getOptions().isCIEnvironment) {
		session.enkore.emitMessage(
			"info", "doing complete typescript check (ci-only)"
		)

		const {diagnosticMessages} = toolchain.tsTypeCheckProgram(myProgram)

		for (const {origin, message} of diagnosticMessages) {
			if (isString(origin.filePath) && isNumber(origin.line)) {
				let {filePath} = origin

				if (filePath.startsWith(session.project.root)) {
					filePath = filePath.slice(session.project.root.length)
				}

				session.enkore.emitMessage("error", `Type error in file '${filePath}' on line ${origin.line}: ${message}`)
			} else {
				session.enkore.emitMessage("error", `Type error: ${message}`)
			}
		}
	}
}

export function preLintFactory(context: APIContext) {
	return impl!.bind(context)
}
