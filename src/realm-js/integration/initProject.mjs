import {writeAtomicFile} from "@anio-software/fs"
import path from "node:path"

export default async function(fourtune_session) {
	await writeAtomicFile(
		path.join(fourtune_session.getProjectRoot(), "tsconfig.json"), 
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
}\n`
	)
}
