export function isRuntimeWrappedContextInstanceV0(
	context
) {
	if (context._kind !== "RuntimeContextInstance") {
		return false
	}

	return context._version === 0
}

export function useContext(
	wrapped_context,
	version
) {
	const actual = wrapped_context._version

	if (actual !== version) {
		throw new Error(
			`Incompatible version, expected v${version} but got v${actual}.`
		)
	}

	return wrapped_context._instance
}
