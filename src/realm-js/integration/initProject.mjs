import asyncSyncProjectInit from "./type/async-sync/initProject.mjs"

export default async function(fourtune_session, writeFile) {
	await writeFile(
		"tsconfig.base.json",
`{
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
		"baseUrl": "./"
	}
}\n`, {overwrite:true}
	)

	await writeFile(
		"tsconfig.src.json",
`{
	"extends": "./tsconfig.base.json",
	"compilerOptions": {
		"paths": {
			"#/*": ["./src/*"],
			"&/*": ["./resources/tsmodule/*"]
		}
	},
	"include": ["./src/**/*"]
}\n`, {overwrite: true}
	)

	await writeFile(
		"tsconfig.resources.json",
`{
	"extends": "./tsconfig.base.json",
	"compilerOptions": {
		"paths": {}
	},
	"include": ["./resources/tsmodule/**/*"]
}\n`, {overwrite: true}
	)

	await writeFile(
		"tsconfig.json",
`{
	"references": [
		{"path": "./tsconfig.src.json"},
		{"path": "./tsconfig.resources.json"}
	]
}\n`, {overwrite: true}
	)

	const project_config = fourtune_session.getProjectConfig()

	if (project_config.type === "package:async/sync") {
		await asyncSyncProjectInit(fourtune_session, writeFile)
	}
}
