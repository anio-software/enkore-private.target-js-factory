import {
	enkoreJSRuntimeInitCodeHeaderMarkerUUID as marker
} from "@anio-software/enkore-private.spec/uuid"

export function parseJSRuntimeInitHeader(code: string): {
	offset: number
}|false {
	if (!code.startsWith(`/*${marker}:`)) {
		return false
	}

	const tmp = code.indexOf("*/")

	if (tmp === -1) {
		return false
	}

	const header = code.slice(
		`/*${marker}.`.length,
		tmp
	)

	const size = parseInt(header, 10)

	if (isNaN(size)) {
		return false
	}

	const headerLength = `/*${marker}:${size}*/`.length

	return {
		offset: size + headerLength
	}
}
