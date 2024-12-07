import {getPathAliases} from "../../../../getPathAliases.mjs"

export async function autogenerateTSConfigFiles(fourtune_session) {
	fourtune_session.autogenerate.addFourtuneFile(
		`cfg/tsconfig.base.json`, function() {
			return JSON.stringify({
				"compilerOptions": {
					"allowImportingTsExtensions": true,
					"allowSyntheticDefaultImports": true,
					"types": ["node"],
					"skipLibCheck": false,
					"strict": true,
					"target": "esnext",
					"module": "nodenext",
					"moduleResolution": "nodenext",
					"isolatedModules": true,
					"baseUrl": "../../../"
				}
			}, null, 4) + "\n"
		}
	)

	fourtune_session.autogenerate.addFourtuneFile(
		`cfg/tsconfig.src.json`, function() {
			return JSON.stringify({
				"extends": "./tsconfig.base.json",
				"compilerOptions": {
					"paths": getPathAliases("./", true)
				},
				"include": ["../../../src/**/*"]
			}, null, 4) + "\n"
		}
	)

	fourtune_session.autogenerate.addFourtuneFile(
		`cfg/tsconfig.auto-src.json`, function() {
			return JSON.stringify({
				"extends": "./tsconfig.base.json",
				"compilerOptions": {
					"paths": getPathAliases("./", true)
				},
				"include": [
					"../../../auto/fourtune/src/**/*",
					"../../../auto/synthetic/async.sync/src/**/*",
					"../../../auto/synthetic/user/src/**/*",
				]
			}, null, 4) + "\n"
		}
	)

	fourtune_session.autogenerate.addFourtuneFile(
		`cfg/tsconfig.assets.json`, function() {
			return JSON.stringify({
				"extends": "./tsconfig.base.json",
				"compilerOptions": {
					"paths": {}
				},
				"include": ["../../../assets/**/*"]
			}, null, 4) + "\n"
		}
	)
}
