function default_logLine(ctx, line) {
	if (typeof process === "object") {
		process.stderr.write(`${line}\n`)
	} else if (typeof console === "object") {
		console.log(line)
	}
}

const log_levels = {
	"error": 3,
	"warn" : 4,
	"info" : 5,
	"debug": 6,
	"trace": 7
}

function default_shouldLog(ctx, level) {
	const message_log_level = log_levels[level]
	const current_log_level = log_levels[ctx.plugs.getCurrentLogLevel(ctx)]

	return !(message_log_level > current_log_level)
}

function default_getCurrentLogLevel(ctx) {
	let current_log_level = "info"

	if (typeof process === "object") {
		if ("FOURTUNE_RUNTIME_LOG_LEVEL" in process.env) {
			current_log_level = process.env["FOURTUNE_RUNTIME_LOG_LEVEL"].toLowerCase()
		}
	} else if (typeof window === "object") {
		if ("FOURTUNE_RUNTIME_LOG_LEVEL" in window) {
			current_log_level = window.FOURTUNE_RUNTIME_LOG_LEVEL.toLowerCase()
		}
	}

	if (!(current_log_level in log_levels)) {
		default_logLine(`Warning: invalid log level '${current_log_level}'`)

		current_log_level = "info"
	}

	return current_log_level
}

function default_logWithLevel(ctx, level, args) {
	let bundle_identifier = ""

	//if (ctx.bundle !== null) {
	//	bundle_identifier = `@${ctx.bundle.id.slice(0, 6)}`
	//}

	if (!ctx.plugs.shouldLog(ctx, level)) {
		return
	}

	let first_line = `[${level.padStart(5, " ")}] <${ctx.package_json.name}${bundle_identifier}> `
	let padding = " ".repeat(first_line.length)

	const log_message = args.map(arg => {
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

	ctx.plugs.logLine(ctx, str.slice(0, str.length - 1))
}

export default function(package_json) {
	let the_context = {
		// Export default implementation for pluggables.
		defaults: {
			getCurrentLogLevel: default_getCurrentLogLevel,
			logLine: default_logLine,
			logWithLevel: default_logWithLevel,
			shouldLog: default_shouldLog
		},

		package_json,
		//anio_project_config,
		//bundle: meta.bundle,

		// Plugs are properties overwritable by the user when importWithContextAysnc()
		plugs: {}
	}

	// Make default plugs call the_context.defaults implementation
	// This makes it possible to either overwrite .plugs OR .defaults
	for (const key in the_context.defaults) {
		the_context.plugs[key] = (...args) => {
			return the_context.defaults[key](...args)
		}
	}

	the_context.log = (...args) => {
		// todo: add async mutex?
		the_context.plugs.logWithLevel(the_context, "debug", args)
	}

	for (const log_level of Object.keys(log_levels)) {
		the_context.log[log_level] = function(...args) {
			the_context.plugs.logWithLevel(the_context, log_level, args)
		}
	}

	return the_context
}
