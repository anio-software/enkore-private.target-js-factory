const aliases = {
	"#": `src/`,
	"##": `auto/src/`,
	"&": `assets/tsmodule/`
}

function removeDoubleSlashes(path) {
	while (path.indexOf("//") !== -1) {
		path = path.split("//").join("/")
	}

	return path
}

export function getPathAliases(prefix = "./", for_typescript = false) {
	let ret = {}

	for (const alias in aliases) {
		const substitute = `${prefix}${aliases[alias]}`

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
