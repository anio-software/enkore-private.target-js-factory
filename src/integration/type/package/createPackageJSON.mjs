function typesPackageName(id) {
	if (id.startsWith("@")) {
		const [org, packageName] = id.split("/")

		return `${org}-types/${packageName}`
	}

	return `${id}--types`
}

export function createPackageJSON(
	fourtune_session, entryPointMap, typeOnly = false
) {
	let exports = {}

	for (const [entryPointName] of entryPointMap.entries()) {
		const entryPointFileName = entryPointName.split("/").join(".")

		let exportDeclarations = {}

		exportDeclarations["types"] = `./entries/${entryPointFileName}/index.min.d.mts`

		if (!typeOnly) {
			exportDeclarations["import"] = `./entries/${entryPointFileName}/index.min.mjs`
		}

		if (entryPointName === "default") {
			exports["."] = exportDeclarations
		} else {
			exports[`./${entryPointName}`] = exportDeclarations
		}
	}

	exports["./package.json"] = {
		import: "./package.json",
		require: "./package.json"
	}

	let newPackageJSON = {
		...fourtune_session.getProjectPackageJSON(),
		exports
	}

	delete newPackageJSON["private"]
	delete newPackageJSON["devDependencies"]
	delete newPackageJSON["scripts"]
	delete newPackageJSON["files"]

	if (typeOnly) {
		newPackageJSON["name"] = typesPackageName(
			newPackageJSON["name"]
		)

		delete newPackageJSON["repository"]
		delete newPackageJSON["engines"]
	}

	return JSON.stringify(newPackageJSON, undefined, 4) + "\n"
}
