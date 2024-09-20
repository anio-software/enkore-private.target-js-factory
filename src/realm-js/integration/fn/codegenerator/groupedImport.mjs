import generateObjectLiteral from "@anio-js-foundation/generate-object-literal"

export default function(src, obj, {
	pad_to_longest_key = false,
	additional_key_padding = 0
} = {}) {
	return generateObjectLiteral(obj, {
		pad_to_longest_key,
		prefix: "import ",
		suffix: ` from ${JSON.stringify(src)};`,
		key_delimiter: " ".repeat(additional_key_padding) + " as "
	})
}
