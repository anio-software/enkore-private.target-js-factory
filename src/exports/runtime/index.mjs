export function isRuntimeWrappedContextInstanceV0(
	context
) {
	if (context._kind !== "RuntimeContextInstance") {
		return false
	}

	return context._version === 0
}
