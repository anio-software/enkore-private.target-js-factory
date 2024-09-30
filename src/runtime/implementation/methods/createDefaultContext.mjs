import createDefaultContext from "../context/createDefaultContext.mjs"

export default function(runtime, options_or_context = {}) {
	return createDefaultContext(runtime, options_or_context)
}
