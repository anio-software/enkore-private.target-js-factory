import type {TargetIdentifier} from "@anio-software/enkore-private.spec/primitives"
import type {PeerDependency} from "./PeerDependency.ts"
import {
	targetsWeb,
	targetsWebDirectly,
	targetsReact
} from "@anio-software/enkore-private.target-js-utils"

const packageVersionRanges: Record<string, string> = {
	"@types/web": ">=0.0.235",
	"@types/node": ">=22.7.x",

	"@types/react": ">=19.1.x",
	"@types/react-dom": ">=19.1.x",
	"react": ">=19.1.x",
	"react-dom": ">=19.1.x",

	"css-modules-ts-plugin": ">=0.0.8",

	"@anio-software/enkore.js-runtime": ">=0.0.40"
}

export function getRequiredPeerDependencyPackages(
	targetIdentifier: TargetIdentifier
): Map<string, PeerDependency> {
	const dependencies: Map<string, PeerDependency> = new Map()

	//
	// @types/node is always needed for development purposes (enkore.config.mts)
	//
	addDependency("@types/node", true)

	if (targetsWebDirectly(targetIdentifier)) {
		addDependency("@types/web", true)
	}

	// js-hybrid-lite doesn't contain CSS support
	if (targetsWeb(targetIdentifier) && targetIdentifier !== "js-hybrid-lite") {
		addDependency("css-modules-ts-plugin", true)
	}

	if (targetsReact(targetIdentifier)) {
		addDependency("@types/react", true)
		addDependency("@types/react-dom", true)

		addDependency("react", false)
		addDependency("react-dom", false)
	}

	addDependency("@anio-software/enkore.js-runtime", true)

	function addDependency(packageName: string, devOnly: boolean) {
		if (!(packageName in packageVersionRanges)) {
			throw new Error(`Unknown package '${packageName}'.`)
		}

		dependencies.set(packageName, {
			packageName,
			packageVersionRange: packageVersionRanges[packageName],
			forDevelopmentOnly: devOnly === true
		})
	}

	return dependencies
}
