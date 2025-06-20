import type {NodePackageJSON} from "@anio-software/enkore-private.spec/primitives"

function indent(str: string): string {
	const lines = str.split("\n")

	return lines.map((line, index) => {
		if (index === 0) return line;

		return `  ${line}`;
	}).join("\n")
}

export function _getPartialPackageJSONString(packageJSON: NodePackageJSON): string {
	let ret = `{\n`

	// filter out keys that have an undefined value and the "exports" key
	const keys = Object.keys(packageJSON).filter(key => {
		return typeof packageJSON[key] !== "undefined" && key !== "exports"
	})

	for (let i = 0; i < keys.length; ++i) {
		const key = keys[i]

		if (key === "exports") continue

		const value = packageJSON[key]
		const hasNextKey = keys.length > (i + 1)

		ret += `  ${JSON.stringify(key)}: ${indent(JSON.stringify(value, null , 2))}`

		ret += hasNextKey ? `,\n` : `\n`
	}

	return ret
}
