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
		"moduleResolution": "nodenext"
	}
}\n`, {overwrite:false}
	)
}
