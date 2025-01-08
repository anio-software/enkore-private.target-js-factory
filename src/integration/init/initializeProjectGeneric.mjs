export async function initializeProjectGeneric(
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

	await writeFile(
		".cicd/deploy.sh",
`#!/bin/bash -eufx

# Needed for experimental releases
# --allow-same-version to make normal releases work (where version is already set in package.json)
#npm version "$RELEASE_VERSION" --git-tag-version false --allow-same-version

cd dist

cd package && npm publish --provenance --access public

cd ..

cd packageTypes && npm publish --access public
`, {overwrite: false}
	)
}
