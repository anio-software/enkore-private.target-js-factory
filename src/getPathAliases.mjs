function removeDoubleSlashes(path) {
	while (path.indexOf("//") !== -1) {
		path = path.split("//").join("/")
	}

	return path
}

export function getPathAliases(prefix = "./", for_typescript = false) {
	const aliases = {
		"#": `${prefix}src/`,
		"##": `${prefix}auto/src/`,
		"&": `${prefix}assets/tsmodule/`
	}

	let ret = {}

	for (const alias in aliases) {
		const substitute = aliases[alias]

		if (for_typescript) {
			ret[`${alias}/*`] = [
				removeDoubleSlashes(`${substitute}/*`)
			]
		} else {
			ret[alias] = removeDoubleSlashes(substitute)
		}
	}

	return ret
}
