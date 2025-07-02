import type {NodePackageJSON} from "@anio-software/enkore-private.spec/primitives"
import {isObject} from "@anio-software/pkg.is"
import {_getPartialPackageJSONString} from "./_getPartialPackageJSONString.ts"
import {
	_packageJSONExportsToSortedArray,
	type PackageJSONExport
} from "./_packageJSONExportsToSortedArray.ts"

type Entry = PackageJSONExport | "spacer"

export function _prettyPrintPackageJSONExports(
	packageJSON: NodePackageJSON
): string {
	if (!isObject(packageJSON.exports)) {
		throw new Error(`exports field must be defined and be an object.`)
	}

	const hasPackageJSONExport = "./package.json" in packageJSON.exports
	const packageExports = _packageJSONExportsToSortedArray(packageJSON.exports)
	let ret = _getPartialPackageJSONString(packageJSON).trimEnd()

	const distExports = packageExports.filter(({path}) => {
		if (path === "./package.json") return false

		return !path.startsWith("./_source")
	})

	const sourceExports = packageExports.filter(({path}) => {
		return path.startsWith("./_source")
	})

	const padLength = Math.max.apply(null, packageExports.map(x => x.path.length)) + 4

	const entries: Entry[] = []

	if (hasPackageJSONExport) {
		entries.push({
			path: "./package.json",
			spec: packageJSON.exports["./package.json"]
		})
	}

	if (distExports.length && sourceExports.length) {
		if (hasPackageJSONExport) entries.push("spacer")

		for (const e of distExports) {
			entries.push(e)
		}

		entries.push("spacer")

		for (const e of sourceExports) {
			entries.push(e) 
		}
	} else if (distExports.length) {
		if (hasPackageJSONExport) entries.push("spacer")

		for (const e of distExports) {
			entries.push(e)
		}
	}

	ret += `,\n`
	ret += `  "exports": {\n`

	for (let i = 0; i < entries.length; ++i) {
		const entry = entries[i]
		const nextEntry = entries.length > (i + 1) ? entries[i + 1] : null

		if (entry === "spacer" && nextEntry === null) {
			throw new Error(`cannot have spacer as last element.`)
		}

		if (entry === "spacer") {
			ret += `\n`

			continue
		}

		ret += `    ${JSON.stringify(entry.path).padEnd(padLength, " ")}:`
		ret += `  ${JSON.stringify(entry.spec)}`

		if (nextEntry !== null) {
			ret += `,`
		}

		ret += `\n`
	}

	ret += `  }\n`
	ret += `}\n`

	try {
		JSON.parse(ret)
	} catch {
		throw new Error(
			`_prettyPrintPackageJSONExports produced invalid JSON:\n` + ret
		)
	}

	return ret
}
