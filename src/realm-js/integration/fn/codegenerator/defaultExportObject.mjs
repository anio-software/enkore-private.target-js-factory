import generateObjectLiteral from "@anio-js-foundation/generate-object-literal"

export default function(entries, {
	pad_to_longest_key = false,
	additional_key_padding = 0
} = {}) {
	return generateObjectLiteral(entries, {
		prefix: `export default `,
		suffix: `;`,
		pad_to_longest_key,
		key_delimiter: " ".repeat(additional_key_padding) + " : "
	})
}
