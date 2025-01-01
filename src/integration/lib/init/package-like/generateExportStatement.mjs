export function generateExportStatement(source, export_name, is_type = false) {
	const source_str = JSON.stringify(source)
	const t_export = is_type ? " type" : ""

	//
	// treat __star_export differently so such
	// that this export may manually export
	// other things.
	//
	if (export_name === "__star_export") {
		return `export${t_export} * from ${source_str}\n`
	} else if (export_name === "__default") {
		return `export${t_export} {default} from ${source_str}\n`
	} else if (export_name === "__index") {
		return `export${t_export} * from ${source_str}\n` +
		       `export${t_export} {default} from ${source_str}\n`
	} else {
		//
		// Normally, the file name is used to
		// create a named export in the output module.
		// This means, myFunction.mjs would be exported as
		// "myFunction"
		//
		return `export${t_export} {${export_name}} from ${source_str}\n`
	}
}
