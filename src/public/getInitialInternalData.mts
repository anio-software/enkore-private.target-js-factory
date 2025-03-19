import type {API} from "#~src/API.d.mts"

const impl: API["getInitialInternalData"] = async function() {
	return {
		entryPointMap: new Map()
	}
}

export const getInitialInternalData = impl
