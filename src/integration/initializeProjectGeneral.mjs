export async function initializeProjectGeneral(
	fourtune_session, writeFile
) {
	await writeFile(
		"tsconfig.json",
`{
	"references": [
		{"path": "./tsconfig.src.json"},
		{"path": "./tsconfig.resources.json"}
	]
}\n`, {overwrite: true}
	)
}
