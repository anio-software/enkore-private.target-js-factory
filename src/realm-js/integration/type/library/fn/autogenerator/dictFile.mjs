import AlphabetIdentifierGenerator from "@anio-js-foundation/alphabet-identifier-generator"
import groupedImport from "../../../../fn/codegenerator/groupedImport.mjs"
import defaultExportObject from "../../../../fn/codegenerator/defaultExportObject.mjs"

export default async function(fourtune_session, path, library_functions) {
	let source = ""

	const generator = new AlphabetIdentifierGenerator()

	let grouped_import = [], default_export = []

	for (const fn of library_functions) {
		grouped_import.push({
			key: fn.canonical_name,
			value: generator.insert(fn.canonical_name)
		})

		grouped_import.push({
			key: fn.canonical_name + "Factory",
			value: generator.insert(fn.canonical_name + "Factory")
		})

		default_export.push({
			key: fn.canonical_path + ".mjs",
			value: generator.lookup(fn.canonical_name)
		})

		default_export.push({
			key: fn.canonical_path + "Factory.mjs",
			value: generator.lookup(fn.canonical_name + "Factory")
		})
	}

	source += groupedImport("./library.mjs", grouped_import, {
		pad_to_longest_key: true,
		additional_key_padding: 5
	})

	source += "\n\n"
	source += defaultExportObject(default_export, {
		pad_to_longest_key: true
	})
	source += "\n"

	return fourtune_session.autogenerate.warningComment() + source
}
