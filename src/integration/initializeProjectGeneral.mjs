export async function initializeProjectGeneral(
	fourtune_session, writeFile
) {
	await writeFile(
		"tsconfig.json",
`{
	"references": [
		{"path": "./auto/cfg/tsconfig.src.json"},
		{"path": "./auto/cfg/tsconfig.resources.json"},
		{"path": "./auto/cfg/tsconfig.auto-src.json"}
	]
}\n`, {overwrite: true}
	)
}
