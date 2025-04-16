import type {RequestedEmbedsFromCodeResult} from "@enkore-types/babel"

type Ret = [
	"specific", Map<string, true>
] | [
	"all"
] | [
	"none"
]

export function combineRequestedEmbedsFromCodeResults(
	results: RequestedEmbedsFromCodeResult[]
): Ret {
	// keep track of requested embeds
	const requestedEmbeds: Map<string, true> = new Map()

	for (const result of results) {
		if (result.codeRequestsEmbeds === false) continue
		if (result.requestedEmbeds === "unknown") {
			return ["all"]
		}

		for (const embed of result.requestedEmbeds) {
			requestedEmbeds.set(embed, true)
		}
	}

	if (!requestedEmbeds.size) {
		return ["none"]
	}

	return ["specific", requestedEmbeds]
}
