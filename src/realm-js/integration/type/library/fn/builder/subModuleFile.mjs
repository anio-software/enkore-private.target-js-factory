import AlphabetIdentifierGenerator from "@anio-js-foundation/alphabet-identifier-generator"
import groupedImport from "../../../../fn/codegenerator/groupedImport.mjs"
import namedExports from "../../../../fn/codegenerator/namedExports.mjs"
import defaultExportObject from "../../../../fn/codegenerator/defaultExportObject.mjs"

export default async function(fourtune_session, file_path, library_functions, sub_module) {
	const generator = new AlphabetIdentifierGenerator()

	let source = ""
	let grouped_import = []
	let named_exports = []
	let default_export = []

	let push = (canonical_name, fn_name) => {
		grouped_import.push({
			key: canonical_name,
			value: generator.insert(canonical_name)
		})

		named_exports.push({
			key: fn_name,
			value: generator.lookup(canonical_name)
		})

		default_export.push({
			key: fn_name,
			value: generator.lookup(canonical_name)
		})
	}

	source += fourtune_session.autogenerate.warningComment()

	for (const fn of library_functions) {
		if (!fn.canonical_path.startsWith(`${sub_module}/`)) continue

		const fn_name = fn.canonical_name.slice(sub_module.length + 1)

		push(fn.canonical_name, fn_name)
		push(fn.canonical_name + "Factory", fn_name + "Factory")
	}

	source += groupedImport("../library.mjs", grouped_import, {
		pad_to_longest_key: true,
		additional_key_padding: 13 - (sub_module.length + 1 + 4) - 1
	})

	source += "\n\n"
	source += namedExports(named_exports, {
		pad_to_longest_key: true
	})

	source += "\n"
	source += defaultExportObject(default_export, {
		pad_to_longest_key: true,
		additional_key_padding: 9
	})

	source += "\n"

	return source
}
