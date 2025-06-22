import type {TargetIdentifier} from "@anio-software/enkore-private.spec/primitives"
import {getRequiredPeerDependencyPackages} from "./getRequiredPeerDependencyPackages.ts"

const packageVersionRanges: Record<string, string> = {
	"@types/web": ">=0.0.235",
	"@types/node": ">=22.7.x",

	"@types/react": ">=19.1.x",
	"@types/react-dom": ">=19.1.x",
	"react": ">=19.1.x",
	"react-dom": ">=19.1.x",

	"css-modules-ts-plugin": ">=0.0.8"
}

export function getRequiredPeerDependencyPackageVersionRanges(
	targetIdentifier: TargetIdentifier
) {
	const packageNames = getRequiredPeerDependencyPackages(targetIdentifier)
	const peerDependencies: Record<string, string> = {}

	for (const packageName of packageNames) {
		if (!(packageName in packageVersionRanges)) {
			throw new Error(`Unknown/unspecified package '${packageName}'.`)
		}

		peerDependencies[packageName] = packageVersionRanges[packageName]
	}

	return peerDependencies
}
