import isWrappedContext from "../isWrappedContext.mjs"
import createWrappedContextInstance from "../createWrappedContextInstance.mjs"

const expected_version = 0

export default function(runtime, options_or_context = {}) {
	if (isWrappedContext(options_or_context)) {
		//
		// check API compatibility
		//
		const {_version, instance} = options_or_context

		if (_version !== expected_version) {
			throw new Error(
				`Incompatible context was passed to useContext().\n` +
				`Expected version: ${expected_version}, actual version: ${_version}.`
			)
		}

		return instance
	}

	return createWrappedContextInstance(
		runtime, options_or_context
	).instance
}
