import AlphabetIdentifierGenerator from "@anio-js-foundation/alphabet-identifier-generator"
import groupedImport from "../../../../fn/codegenerator/groupedImport.mjs"
import generateObjectLiteral from "@anio-js-foundation/generate-object-literal"

export default async function(fourtune_session, file_path, library_functions) {
	let source = ""

	const generator = new AlphabetIdentifierGenerator()

	let grouped_import = [], library_literal = [], library_literal2 = []

	for (const fn of library_functions) {
		grouped_import.push({
			key: `${fn.canonical_name}Factory`,
			value: `${fn.canonical_name}Factory` //generator.insert(fn.canonical_name + "Factory")
		})

		library_literal.push({
			key: `${fn.canonical_name}`,
			value: /*"await " + */fn.canonical_name + "Factory" + "(null, library_context)"
		})

		library_literal.push({
			key: `${fn.canonical_name}Factory`,
			value: `${fn.canonical_name}Factory`//generator.lookup(fn.canonical_name + "Factory")
		})

		library_literal2.push({
			key: `${fn.canonical_path}.mjs`,
			value: `library[${JSON.stringify(fn.canonical_name)}]`
		})

		library_literal2.push({
			key: `${fn.canonical_path}Factory.mjs`,
			value: `library[${JSON.stringify(fn.canonical_name + "Factory")}]`
		})
	}

	let lib = generateObjectLiteral(library_literal, {
		prefix: `let library = `,
		indentation: 4,
		pad_to_longest_key: true,
		key_delimiter: " ".repeat(6) + " : "
	})

	let dict = generateObjectLiteral(library_literal2, {
		prefix: `library.dict = `,
		indentation: 4,
		pad_to_longest_key: true
	})

	source += `import {createDefaultContext} from "@fourtune/realm-js/runtime"\n`

	source += groupedImport("./library.mjs", grouped_import, {
		pad_to_longest_key: true,
		additional_key_padding: 9
	})

	source += "\n\n"

	source += "export default function importWithContext(plugs = {}, new_context = null) {\n"

	source += `    let library_context = new_context\n\n`

	source += `    // Context is created here so every function has the same context\n`
	source += `    if (library_context === null) {\n`
	source += `        library_context = createDefaultContext()\n`
	source += `    }\n\n`

	source += `    // Plugs are set here so every function has the same context\n`

	source += `    for (const key in plugs) {\n`
	source += `        library_context.plugs[key] = plugs[key];\n`
	source += `    }\n\n`

	source += `${lib};\n`

	source += `\n${dict};\n`
	source += `\n    library.importWithContext = importWithContext;\n`
	source += `    library.getUsedDefaultContext = function getUsedDefaultContext() { return library_context; };\n`
	source += `\n    return library;\n`
	source += "}\n"

	return fourtune_session.autogenerate.warningComment() + source
}
