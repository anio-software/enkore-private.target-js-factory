import type {
	RequestedEmbedsFromCodeResult,
	RequestedEmbedsFromCodeReasonWhyUnknown
} from "@enkore-types/target-js-toolchain"

type Ret = [
	"specific", Map<string, string>
] | [
	"all", RequestedEmbedsFromCodeReasonWhyUnknown[]
] | [
	"none"
]

export function combineRequestedEmbedsFromCodeResults(
	results: RequestedEmbedsFromCodeResult[]
): Ret {
	// keep track of requested embeds
	const requestedEmbeds: Map<string, string> = new Map()
	const reasonsWhyUnknown: Map<RequestedEmbedsFromCodeReasonWhyUnknown, true> = new Map()

	for (const result of results) {
		if (result.codeRequestsEmbeds === false) continue
		if (result.requestedEmbeds === "unknown") {
			reasonsWhyUnknown.set(result.reasonWhyUnknown, true)

			continue
		}

		for (const embed of result.requestedEmbeds) {
			requestedEmbeds.set(embed.embedPath, embed.requestedByMethod)
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
