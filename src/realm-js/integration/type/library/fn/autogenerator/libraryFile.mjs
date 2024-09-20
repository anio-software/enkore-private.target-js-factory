import AlphabetIdentifierGenerator from "@anio-js-foundation/alphabet-identifier-generator"
import namedExports from "../../../../fn/codegenerator/namedExports.mjs"

function importStatement(alias, path){
	return `import ${alias} from ${JSON.stringify(path)}\n`
}

function addFunction(fn, generator) {
	let ret = ""

	const fn_name = fn.canonical_name
	const fn_path = "../export/" + fn.canonical_path + ".mjs"

	const fn_factory_name = fn.canonical_name + "Factory"
	const fn_factory_path = "../export/" + fn.canonical_path + "Factory.mjs"

	// null means use imported user defined function
	let fn_source = null, fn_factory_source = null

	// auto-generate factory
	if (fn.autogenerate === "factory") {
		const fn_id = generator.insert(fn_name)
		ret += importStatement(fn_id, fn_path)

		fn_factory_source = `function ${fn_name}Factory(new_context) { return ${fn_id}; }`
	}
	// auto-generate function
	else if (fn.autogenerate === "function") {
		const fn_factory_id = generator.insert(fn_factory_name)
		ret += importStatement(fn_factory_id, fn_factory_path)

		fn_source = fn_factory_id + "(_module_default_context)"
	}
	// both function and factory were specified by user
	else if (fn.autogenerate === null) {
		const fn_id = generator.insert(fn_name)
		const fn_factory_id = generator.insert(fn_factory_name)

		ret += importStatement(fn_id, fn_path)
		ret += importStatement(fn_factory_id, fn_factory_path)
	}

	if (fn_source === null) {
		fn_source = generator.lookup(fn_name)
	}

	if (fn_factory_source === null) {
		fn_factory_source = generator.lookup(fn_factory_name)
	}

	let named_exports = [{
		key: fn_name,
		value: `wrapFunction("${fn_name}", ${fn_source})`
	}, {
		key: fn_factory_name,
		value: `wrapFactory("${fn_name}", ${fn_factory_source})`
	}]

	ret += namedExports(named_exports, {
		pad_to_longest_key: false
	})

	return ret
}

export default async function(fourtune_session, path, library_functions) {
	let source = ``

	source += `import {createDefaultContext} from "@fourtune/realm-js"
import wrapFactory from "./support_files/wrapFactory.mjs"
import wrapFunction from "./support_files/wrapFunction.mjs"

`

	source += `// Module's default context
const _module_default_context = createDefaultContext()

export function getUsedDefaultContext() {
	return _module_default_context
}

`

	const generator = new AlphabetIdentifierGenerator()

	for (const fn of library_functions) {
		source += `// ${fn.canonical_path}\n`
		source += addFunction(fn, generator)
		source += "\n"
	}

	// remove trailing \n
	source = source.slice(0, source.length - 1)

	return fourtune_session.autogenerate.warningComment() + source
}
