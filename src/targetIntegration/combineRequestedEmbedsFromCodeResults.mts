import type {
	RequestedEmbedsFromCodeResult,
	RequestedEmbedsFromCodeReasonWhyUnknown
} from "@enkore-types/babel"

type Ret = [
	"specific", Map<string, true>
] | [
	"all", RequestedEmbedsFromCodeReasonWhyUnknown[]
] | [
	"none"
]

export function combineRequestedEmbedsFromCodeResults(
	results: RequestedEmbedsFromCodeResult[]
): Ret {
	// keep track of requested embeds
	const requestedEmbeds: Map<string, true> = new Map()
	const reasonsWhyUnknown: Map<RequestedEmbedsFromCodeReasonWhyUnknown, true> = new Map()

	for (const result of results) {
		if (result.codeRequestsEmbeds === false) continue
		if (result.requestedEmbeds === "unknown") {
			reasonsWhyUnknown.set(result.reasonWhyUnknown, true)

			continue
		}

		for (const embed of result.requestedEmbeds) {
			requestedEmbeds.set(embed, true)
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
