import {getPathAliases} from "../../../../getPathAliases.mjs"

export async function autogenerateTSConfigFiles(fourtune_session) {
	fourtune_session.autogenerate.addFile(
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
					"baseUrl": "../../"
				}
			}, null, 4) + "\n"
		}
	)

	fourtune_session.autogenerate.addFile(
		`cfg/tsconfig.src.json`, function() {
			return JSON.stringify({
				"extends": "./tsconfig.base.json",
				"compilerOptions": {
					"paths": getPathAliases("./", true)
				},
				"include": ["../../src/**/*"]
			}, null, 4) + "\n"
		}
	)

	fourtune_session.autogenerate.addFile(
		`cfg/tsconfig.auto-src.json`, function() {
			return JSON.stringify({
				"extends": "./tsconfig.base.json",
				"compilerOptions": {
					"paths": getPathAliases("./", true)
				},
				"include": ["../../auto/src/**/*"]
			}, null, 4) + "\n"
		}
	)

	fourtune_session.autogenerate.addFile(
		`cfg/tsconfig.assets.json`, function() {
			return JSON.stringify({
				"extends": "./tsconfig.base.json",
				"compilerOptions": {
					"paths": {}
				},
				"include": ["../../assets/tsmodule/**/*"]
			}, null, 4) + "\n"
		}
	)
}
