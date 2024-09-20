import AlphabetIdentifierGenerator from "@anio-js-foundation/alphabet-identifier-generator"
import namedExports from "../../../../fn/codegenerator/namedExports.mjs"
import groupedImport from "../../../../fn/codegenerator/groupedImport.mjs"
import defaultExportObject from "../../../../fn/codegenerator/defaultExportObject.mjs"

export default async function(fourtune_session, file_path, library_functions) {
	const generator = new AlphabetIdentifierGenerator()

	let source = ""

	let grouped_import = [], named_exports = [], default_export = []

	source += `import ${generator.insert("dict")} from "./dict.mjs"\n`
	source += `import ${generator.insert("importWithContext")} from "./importWithContext.mjs"\n`

	let push = (o, imp = true) => {
		if (imp) grouped_import.push(o)
		named_exports.push(o)
		default_export.push(o)
	}

	push("Generic library exports")

	push({
		key: "dict",
		value: generator.lookup("dict")
	}, false)

	push({
		key: "importWithContext",
		value: generator.lookup("importWithContext")
	}, false)

	push({
		key: "getUsedDefaultContext",
		value: generator.insert("getUsedDefaultContext")
	})

	push("User defined library functions")

	for (const fn of library_functions) {
		push({
			key: fn.canonical_name,
			value: generator.insert(fn.canonical_name)
		})

		push({
			key: fn.canonical_name + "Factory",
			value: generator.insert(fn.canonical_name + "Factory")
		})
	}

	source += "\n"
	source += groupedImport("./library.mjs", grouped_import, {
		pad_to_longest_key: true,
		additional_key_padding: 8
	})

	source += `\n`
	source += `\n`

	source += namedExports(named_exports, {
		pad_to_longest_key: true
	})

	source += `\n`

	source += defaultExportObject(default_export, {
		pad_to_longest_key: true,
		additional_key_padding: 9
	})

	source += `\n`

	return fourtune_session.autogenerate.warningComment() + source
}
