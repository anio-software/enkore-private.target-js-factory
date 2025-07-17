import type {APIContext} from "./APIContext.ts"
import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import path from "node:path"

export function getExportsNamingPolicyExemptions(
	apiContext: APIContext,
	session: EnkoreSessionAPI,
	entryPointPath: string
): Set<string> {
	const targetOptions = session.target.getOptions(apiContext.target)
	const ret: Set<string> = new Set()

	if (!targetOptions.exports) {
		return ret
	} else if (!(entryPointPath in targetOptions.exports)) {
		return ret
	}

	const entryPointConfig = targetOptions.exports[entryPointPath]

	if (!entryPointConfig.fileNamingPolicy) {
		return ret
	}

	const prefix = `project/export/${entryPointPath}/`

	for (const entry of entryPointConfig.fileNamingPolicy.exemptions) {
		let exemption = path.normalize(entry)

		if (!exemption.startsWith(prefix)) {
			session.enkore.emitMessage("error", `invalid path for file naming policy, it must start with '${prefix}'`)

			continue
		}

		ret.add(exemption.slice(prefix.length))
	}

	return ret
}
