//
// Example: @anio-software/enkore-private.target-js-factory@0.0.340
//
type Result = {
	scope: string|undefined
	packageName: string
	packageVersion: string
}

function parsePackageIdentifier(identifier: string): Result {
	const parts = identifier.split("@")

	if (parts.length !== 2) {
		throw new Error(`Invalid project identifier '${identifier}'.`)
	}

	return {
		scope: undefined,
		packageName: parts[0],
		packageVersion: parts[1]
	}
}

function parseScopedPackageIdentifier(identifier: string): Result {
	const parts = identifier.split("/")

	if (parts.length !== 2) {
		throw new Error(`Invalid project identifier '${identifier}'.`)
	}

	const scope = parts[0]
	const {packageName, packageVersion} = parsePackageIdentifier(parts[1])

	return {
		scope,
		packageName,
		packageVersion
	}
}

export function _parseEnkoreEmbedProjectIdentifier(
	projectIdentifier: string
): Result {
	if (projectIdentifier.startsWith("@")) {
		return parseScopedPackageIdentifier(projectIdentifier.slice(1))
	}

	return parsePackageIdentifier(projectIdentifier)
}
