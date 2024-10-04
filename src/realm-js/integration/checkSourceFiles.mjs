import path from "node:path"
import {scandir} from "@anio-software/fs"
import {loadRealmDependencies} from "../auto/base-realm.mjs"

function checkFiles(ts, files, compiler_options) {
	const ret = []

	const program = ts.createProgram(files, compiler_options)
	const result = program.emit()

	const all_diagnostics = ts.getPreEmitDiagnostics(program).concat(result.diagnostics)

	for (const diagnostic of all_diagnostics) {
		const {code, messageText} = diagnostic
		const message = ts.flattenDiagnosticMessageText(messageText, "\n")

		if (diagnostic.file) {
			const {line, character} = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start)

			ret.push({
				code,
				message: `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
			})
		} else {
			ret.push({code, message})
		}
	}

	return ret
}

export default async function(fourtune_session) {
	const files = await scandir(
		path.join(fourtune_session.getProjectRoot(), "src"),
		{
			filter({type, name}) {
				if (type !== "file") return false

				if (name.endsWith(".mjs")) return true
				if (name.endsWith(".d.mts")) return true

				return false
			},

			map(entry) {
				return path.join("src", entry.relative_path)
			}
		}
	)

	const project_root = fourtune_session.getProjectRoot()

	const {
		getDependency,
		getPathOfDependency
	} = await loadRealmDependencies(
		project_root, "realm-js"
	)

	const ts = getDependency("typescript")

	const ignored_codes = [
		7005,   // Variable '{0}' implicitly has an '{1}' type.
		7006,   // Parameter '{0}' implicitly has an '{1}' type.
		7008,   // Member '{0}' implicitly has an '{1}' type.
		7009,   // 'new' expression, whose target lacks a construct signature, implicitly has an 'any' type.
		7010,   // '{0}', which lacks return-type annotation, implicitly has an '{1}' return type.
		7011,   // Function expression, which lacks return-type annotation, implicitly has an '{0}' return type.
		7012,   // This overload implicitly returns the type '{0}' because it lacks a return type annotation.

		7017,   // Element implicitly has an 'any' type because type '{0}' has no index signature.
		7018,   // Object literal's property '{0}' implicitly has an '{1}' type.
		7019,   // Rest parameter '{0}' implicitly has an 'any[]' type.
		7034,   // Variable '{0}' implicitly has type '{1}' in some locations where its type cannot be determined.
	]

	const messages = checkFiles(ts, files, {
		//allowSyntheticDefaultImports: true,

		skipLibCheck: false,

		allowJs: true,
		checkJs: true,
		noEmit: true,

		strict: true,

		target: ts.ScriptTarget.ESNext,

		module: ts.ModuleKind.NodeNext,
		moduleResolution: ts.ModuleResolutionKind.NodeNext,

		types: [
			getPathOfDependency("@types/node")
		]
	}).filter(({code}) => {
		return !ignored_codes.includes(code)
	})

	for (const {code, message} of messages) {
		fourtune_session.addWarning(`ts-${code}`, message)
	}
}
