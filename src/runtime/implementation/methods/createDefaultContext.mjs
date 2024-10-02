import isWrappedContext from "../isWrappedContext.mjs"
import createWrappedContextInstance from "../createWrappedContextInstance.mjs"

export default function(runtime, options_or_context = {}) {
	if (isWrappedContext(options_or_context)) {
		return options_or_context
	}

	return createWrappedContextInstance(runtime, options_or_context)
}
