export async function initializeGenericProject(
	fourtune_session, writeFile
) {
	await writeFile(
		"tsconfig.json",
`{
	"references": [
		{"path": "./auto/cfg/tsconfig.src.json"},
		{"path": "./auto/cfg/tsconfig.assets.json"},
		{"path": "./auto/cfg/tsconfig.auto-src.json"}
	]
}\n`, {overwrite: true}
	)
}
