import type {TargetIdentifier} from "@anio-software/enkore-private.spec/primitives"
import {isWebTarget, isReactTarget} from "@enkore/target-js-utils"

export function getRequiredPeerDependencyPackages(
	targetIdentifier: TargetIdentifier
): string[] {
	const packages: string[] = ["@types/node"]

	if (isWebTarget(targetIdentifier)) {
		packages.push("@types/web")
		packages.push("css-modules-ts-plugin")
	}

	if (isReactTarget(targetIdentifier)) {
		packages.push("@types/react")
		packages.push("@types/react-dom")

		packages.push("react")
		packages.push("react-dom")
	}

	return packages
}
