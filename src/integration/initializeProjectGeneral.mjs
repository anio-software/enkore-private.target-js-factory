export async function initializeProjectGeneral(
	fourtune_session, writeFile
) {
	await writeFile(
		"tsconfig.json",
`{
	"references": [
		{"path": "./auto/cfg/tsconfig.src.json"},
		{"path": "./auto/cfg/tsconfig.resources.json"}
	]
}\n`, {overwrite: true}
	)
}
