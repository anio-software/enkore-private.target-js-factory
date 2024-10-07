import path from "node:path"
import {scandir} from "@anio-software/fs"
import {loadRealmDependencies} from "../auto/base-realm.mjs"
import getTypeScriptCompilerOptions from "./fn/getTypeScriptCompilerOptions.mjs"

function checkFiles(ts, files, compiler_options) {
	const ret = []

	const program = ts.createProgram(files, {
		...compiler_options,
		allowJs: true,
		checkJs: true,
		noEmit: true
	})
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

				if (name.endsWith(".mts")) return true
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

	const ignored_codes = []

	const compiler_options = await getTypeScriptCompilerOptions(
		fourtune_session
	)

	const messages = checkFiles(ts, files, compiler_options).filter(({code}) => {
		return !ignored_codes.includes(code)
	})

	for (const {code, message} of messages) {
		fourtune_session.addWarning(`ts-${code}`, message)
	}
}
