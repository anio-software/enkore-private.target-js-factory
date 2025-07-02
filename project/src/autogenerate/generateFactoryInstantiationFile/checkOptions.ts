import type {Options} from "./Options.ts"
import {
	destinationPathToFunctionName
} from "./destinationPathToFunctionName.ts"

export function checkOptions(options: Options) {
	if (!options.source.startsWith("project/")) {
		throw new Error(`source must start with project/.`)
	} else if (!options.destination.startsWith("project/")) {
		throw new Error(`destination must start with project/.`)
	}

	const exportName = destinationPathToFunctionName(options.destination)

	if (!exportName.endsWith("Factory")) {
		throw new Error(`destination must end with 'Factory.ts' or 'Factory.as.ts'.`)
	}
}
