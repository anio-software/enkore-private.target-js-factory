import {
	enkoreJSRuntimeInitCodeHeaderMarkerUUID
} from "@anio-software/enkore-private.spec/uuid"

export function _parseJSRuntimeInitHeader(code: string): {
	offset: number
}|false {
	if (!code.startsWith(`/*${enkoreJSRuntimeInitCodeHeaderMarkerUUID}:`)) {
		return false
	}

	const tmp = code.indexOf("*/")

	if (tmp === -1) {
		return false
	}

	const header = code.slice(
		`/*${enkoreJSRuntimeInitCodeHeaderMarkerUUID}.`.length,
		tmp
	)

	const size = parseInt(header, 10)

	if (isNaN(size)) {
		return false
	}

	const headerLength = `/*${enkoreJSRuntimeInitCodeHeaderMarkerUUID}:${size}*/`.length

	return {
		offset: size + headerLength
	}
}
