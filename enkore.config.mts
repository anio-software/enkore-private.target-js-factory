import {defineConfig} from "@anio-software/enkore"
import {defineTargetJSConfig} from "@anio-software/enkore.target-js"

export const config: unknown = defineConfig({
	target: {
		name: "js",
		options: defineTargetJSConfig({
			environment: ["node"],

			registry: {
				"anioSoftware": {
					url: "https://npm-registry.anio.software",
					authTokenFilePath: "secrets/anio_npm_auth_token",
					clientPrivateKeyFilePath: "secrets/npm_client.pkey",
					clientCertificateFilePath: "secrets/npm_client.cert"
				}
			},

			packageSourceRegistryByScope: {
				"@anio-software": {
					registry: "anioSoftware"
				}
			},

			publish: [{
				registry: "anioSoftware"
			}]
		})
	}
})
