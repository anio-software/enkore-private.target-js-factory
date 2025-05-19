import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import {_productNameToNPMPackage} from "../_productNameToNPMPackage.mts"
import {getInternalData} from "../getInternalData.mts"
import type {Registry} from "../InternalData.d.mts"
import {_npmRegistryToConfigString} from "../_npmRegistryToConfigString.mts"
import {resolvePathSync} from "@aniojs/node-fs"
import {_getPublishedVersionsOfPackage} from "../_getPublishedVersionsOfPackage.mts"
import {_executeNPMWithConfig} from "../_executeNPMWithConfig.mts"
import path from "node:path"

const impl: API["publishProduct"] = async function(
	this: APIContext, session, productName
) {
	if (productName === "project" || productName === "projectTypes") {
		session.enkore.emitMessage("debug", `skipping publish for '${productName}'`)

		return
	} else if (productName.startsWith("npmPackage_")) {
		const registryMap = getInternalData(session).registryMap

		const [
			packageIndex,
			npmPackage
		] = _productNameToNPMPackage(session, productName)

		const {publishConfig} = npmPackage

		if (publishConfig.skip === true) {
			session.enkore.emitMessage(
				"info",
				`user requested to skip publish of package '${npmPackage.name}'.`
			)

			return
		}

		if (!registryMap.has(publishConfig.registry)) {
			session.enkore.emitMessage(
				"error", `referenced registry '${publishConfig.registry}' not configured.`
			)

			return
		}

		const registry: Registry = (() => {
			const reg = registryMap.get(publishConfig.registry)!

			return {
				url: reg.url,
				authTokenFilePath: resolve(reg.authTokenFilePath),
				clientCertificateFilePath: resolve(reg.clientCertificateFilePath),
				clientPrivateKeyFilePath: resolve(reg.clientPrivateKeyFilePath)
			}

			function resolve(p: string|undefined): string|undefined {
				if (!p) return undefined

				return resolvePathSync(
					path.join(session.project.root, p)
				)
			}
		})()

		const publishedVersions = _getPublishedVersionsOfPackage(
			registry,
			npmPackage.name
		)

		if (publishedVersions) {
			session.enkore.emitMessage(
				"info", `latest package versions: ${publishedVersions.slice(-10).join(", ")}`
			)

			if (publishedVersions.includes(npmPackage.version)) {
				session.enkore.emitMessage(
					"info",
					`package '${npmPackage.name}@${npmPackage.version}' already published in registry` +
					` '${registry.url}'. exiting early.`
				)

				return
			}
		}

		session.enkore.emitMessage(
			`info`,
			`npmPackage_${packageIndex}: publishing '${npmPackage.name}'` +
			` at registry '${registry.url}'.` +
			` version=${npmPackage.version} ` +
			` tag=${publishConfig.tag}` +
			` provenance=${publishConfig.publishWithProvenance === true ? "yes" : "no"}`
		)

		const npmPublishArgs: string[] = ["publish"]

		if (publishConfig.publishWithProvenance === true) {
			npmPublishArgs.push("--provenance")
		}

		npmPublishArgs.push("--tag")
		npmPublishArgs.push(publishConfig.tag)

		npmPublishArgs.push("--access")
		npmPublishArgs.push("public")

		session.enkore.emitMessage(
			"info", `using publish args: [${npmPublishArgs.slice(1).join(", ")}]`
		)

		const child = _executeNPMWithConfig(
			_npmRegistryToConfigString(registry, {
				includeAuthToken: true
			}), npmPublishArgs, {
				cwd: path.join(
					session.project.root,
					"products",
					`npmPackage_${packageIndex}`
				)
			}
		)

		if (child.status !== 0) {
			console.log("child stdout", child.stdout.toString())
			console.log("child stderr", child.stderr.toString())

			session.enkore.emitMessage("error", `failed to publish package '${npmPackage.name}'.`)

			return
		}

		session.enkore.emitMessage(
			"info",
			`successfully published '${npmPackage.name}@${npmPackage.version}'` +
			` at registry '${registry.url}'`
		)
	} else {
		throw new Error(`invalid product name '${productName}'`)
	}
}

export function publishProductFactory(context: APIContext) {
	return impl!.bind(context)
}
