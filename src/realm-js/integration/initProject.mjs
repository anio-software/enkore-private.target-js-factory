import asyncSyncProjectInit from "./type/async-sync/initProject.mjs"

export default async function(fourtune_session, writeFile) {
	await writeFile(
		"tsconfig.json",
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
		"baseUrl": "./",
		"paths": {
			"#/*": ["./src/*"],
			"&/*": ["./objects/ephemerals/*"]
		}
	}
}\n`, {overwrite:true}
	)

	const project_config = fourtune_session.getProjectConfig()

	if (project_config.type === "package:async/sync") {
		await asyncSyncProjectInit(fourtune_session, writeFile)
	}
}
