function getLongestKey(list) {
	let longest_key = ""

	for (const entry of list) {
		const type = Object.prototype.toString.call(entry).toLowerCase()

		if (type === "[object string]") continue

		const {key} = entry

		if (key.length > longest_key.length) {
			longest_key = key
		}
	}

	return longest_key
}

export default function(list, {
	pad_to_longest_key = false,
	additional_padding = 0
} = {}) {
	let str = ""

	const longest_key = getLongestKey(list)

	for (const entry of list) {
		const type = Object.prototype.toString.call(entry).toLowerCase()

		if (type !== "[object string]") {
			const {key, value} = entry

			let padding = " ".repeat(additional_padding)

			if (pad_to_longest_key) {
				padding += " ".repeat(longest_key.length - key.length)
			}

			str += `export const ${key}${padding} = ${value};\n`
		} else {
			str += `// ${entry}\n`
		}
	}

	return str
}
