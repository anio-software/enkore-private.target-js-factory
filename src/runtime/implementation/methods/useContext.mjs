import useContext from "../context/useContext.mjs"

export default function(runtime, options_or_context = {}) {
	return useContext(runtime, options_or_context)
}
