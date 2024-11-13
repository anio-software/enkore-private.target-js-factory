export async function initializeGenericProject(
	fourtune_session, writeFile
) {
	await writeFile(
		"tsconfig.json",
`{
	"references": [
		{"path": "./auto/fourtune/cfg/tsconfig.src.json"},
		{"path": "./auto/fourtune/cfg/tsconfig.assets.json"},
		{"path": "./auto/fourtune/cfg/tsconfig.auto-src.json"}
	]
}\n`, {overwrite: true}
	)
}
