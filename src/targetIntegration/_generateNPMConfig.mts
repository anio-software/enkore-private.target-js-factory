import path from "node:path"
import {resolvePathSync, readFileStringSync} from "@aniojs/node-fs"
import type {
	EnkoreTargetJSNoneOptions,
	EnkoreTargetJSNodeOptions,
	EnkoreTargetJSWebOptions
} from "@enkore/spec"

// todo: a bit whacky but it's fine for now
type Options = EnkoreTargetJSNoneOptions | EnkoreTargetJSNodeOptions | EnkoreTargetJSWebOptions

export function _generateNPMConfig(
	projectRoot: string,
	registry: NonNullable<Options["npm"]>["registry"],
	includeSensitiveInformation?: boolean,
	resolveRelativePaths?: boolean
): string {
	if (registry === undefined) {
		return ""
	}

	let npmConfig = ``

	const registries = Array.isArray(registry) ? registry : [registry]

	for (const reg of registries) {
		const regBase = removeHTTPProtocolFromURL(reg.url)

		if (reg.scope) {
			const scopes = Array.isArray(reg.scope) ? reg.scope : [reg.scope]

			for (const scope of scopes) {
				npmConfig += `${scope}:registry=${JSON.stringify(reg.url)}\n`
			}
		} else {
			npmConfig += `registry=${JSON.stringify(reg.url)}\n`
		}

		if (reg.clientPrivateKeyFilePath) {
			npmConfig += `//${regBase}:keyfile=${JSON.stringify(
				resolve(reg.clientPrivateKeyFilePath)
			)}\n`
		}

		if (reg.clientCertificateFilePath) {
			npmConfig += `//${regBase}:certfile=${JSON.stringify(
				resolve(reg.clientCertificateFilePath).trim()
			)}\n`
		}

		if (reg.authTokenFilePath && includeSensitiveInformation === true) {
			//          printf "%s\n" "//registry.npmjs.org/:_authToken=${{ inputs.npm-token }}" >> ./.npmrc
			npmConfig += `//${regBase}:_authToken=${JSON.stringify(
				readFileStringSync(
					resolve(reg.authTokenFilePath)
				)
			)}\n`
		}
	}

	return npmConfig

	function removeHTTPProtocolFromURL(url: string) {
		if (url.startsWith("https://")) {
			return url.slice("https://".length)
		} else if (url.startsWith("http://")) {
			return url.slice("http://".length)
		}

		return url
	}

	function resolve(p: string) {
		if (path.isAbsolute(p) || resolveRelativePaths !== true) {
			return p
		}

		return resolvePathSync(
			path.join(projectRoot, p), [
				"regularFile",
				"regularDir"
			]
		)
	}
}
