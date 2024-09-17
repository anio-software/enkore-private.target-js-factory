export default function(path) {
	let parts = path.split("/")
	let stack = []

	for (const part of parts) {
		if (part === ".") {

		} else if (part === "..") {
			stack.pop()
		} else if (part.length) {
			stack.push(part)
		}
	}

	return stack.join("/")
}
