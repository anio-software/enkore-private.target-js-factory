//(level : LogLevelType, lines : Array<string>) : void
export default function(level, lines) {
	if (!this.options.shouldLog(level)) {
		return
	}

	// todo: add bundle identifier?
	let first_line = `[${level.padStart(5, " ")}] <${this.package_json.name}> `
	let padding = " ".repeat(first_line.length)

	const log_message = lines.map(arg => {
		return arg.toString()
	}).join("\n")

	const log_lines = log_message.split("\n")

	let str = ``

	for (let i = 0; i < log_lines.length; ++i) {
		let current_line = padding

		if (i === 0) {
			current_line = first_line
		}

		current_line += log_lines[i]

		str += `${current_line}\n`
	}

	this.options.printLine(
		str.slice(0, str.length - 1)
	)
}
