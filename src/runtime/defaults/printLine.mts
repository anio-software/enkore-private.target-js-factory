import type {
	EnkoreJSRuntimeContextOptions
} from "@enkore/spec"

export const defaultPrintLine: EnkoreJSRuntimeContextOptions["printLine"] = function(
	context, line
) {
	void context;

	if (typeof process === "object") {
		process.stderr.write(`${line}\n`)
	} else if (typeof console === "object") {
		console.log(line)
	}
}
