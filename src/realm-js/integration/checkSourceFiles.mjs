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
			filter(entry) {
				return entry.type === "file" &&
				       entry.name.endsWith(".mjs")
			},

			map(entry) {
				return path.join("src", entry.relative_path)
			}
		}
	)

	const project_root = fourtune_session.getProjectRoot()
	const {getDependency} = await loadRealmDependencies(
		project_root, "realm-js"
	)

	const ts = getDependency("typescript")

	const messages = checkFiles(ts, files, {
		//allowSyntheticDefaultImports: true,

		skipLibCheck: false,

		allowJs: true,
		checkJs: true,
		noEmit: true,

		strict: true,

		target: ts.ScriptTarget.ESNext,

		module: ts.ModuleKind.NodeNext,
		moduleResolution: ts.ModuleResolutionKind.NodeNext
	})

	console.log(messages)
}
