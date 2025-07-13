import type {
	RequestedEmbedsFromCodeResult,
	RequestedEmbedsFromCodeReasonWhyUnknown
} from "@anio-software/enkore-private.target-js-toolchain_types"

type Ret = [
	"specific", Map<string, {
		requestedByMethods: Set<string>
	}>
] | [
	"all", RequestedEmbedsFromCodeReasonWhyUnknown[]
] | [
	"none"
]

export function combineRequestedEmbedsFromCodeResults(
	results: RequestedEmbedsFromCodeResult[]
): Ret {
	// keep track of requested embeds
	const requestedEmbeds: Map<string, {
		requestedByMethods: Set<string>
	}> = new Map()
	const reasonsWhyUnknown: Map<RequestedEmbedsFromCodeReasonWhyUnknown, true> = new Map()

	for (const result of results) {
		if (result.codeRequestsEmbeds === false) continue
		if (result.requestedEmbeds === "unknown") {
			reasonsWhyUnknown.set(result.reasonWhyUnknown, true)

			continue
		}

		for (const embed of result.requestedEmbeds) {
			if (!requestedEmbeds.has(embed.embedPath)) {
				requestedEmbeds.set(embed.embedPath, {
					requestedByMethods: new Set()
				})
			}

			requestedEmbeds.get(embed.embedPath)!.requestedByMethods.add(
				embed.requestedByMethod
			)
		}
	}

	if (reasonsWhyUnknown.size) {
		return [
			"all", [...reasonsWhyUnknown.entries()].map(([key]) => key)
		]
	}

	if (!requestedEmbeds.size) {
		return ["none"]
	}

	return ["specific", requestedEmbeds]
}
