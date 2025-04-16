import type {RequestedEmbedsFromCodeResult} from "@enkore-types/babel"

export function combineRequestedEmbedsFromCodeResults(
	results: RequestedEmbedsFromCodeResult[]
): Map<string, true>|"all"|"none" {
	// keep track of requested embeds
	const requestedEmbeds: Map<string, true> = new Map()

	for (const result of results) {
		if (result.codeRequestsEmbeds === false) continue
		if (result.requestedEmbeds === "unknown") {
			return "all"
		}

		for (const embed of result.requestedEmbeds) {
			requestedEmbeds.set(embed, true)
		}
	}

	if (!requestedEmbeds.size) {
		return "none"
	}

	return requestedEmbeds
}
