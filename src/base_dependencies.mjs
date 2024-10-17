function useFromJSBundler(import_name) {
	return {
		import_from: "@fourtune/js-bundler",
		import_code: `import {${import_name}} from "@fourtune/js-bundler/exports"\nexport default ${import_name}`
	}
}

export default {
	"@fourtune/js-bundler": {
		version: "0.0.3"
	},
	//
	// needed to check javascript files
	//
	"typescript": useFromJSBundler("ts"),
	//
	// used to transpile js code
	//
	"@babel/core": {
		version: "7.25.7"
	},
	//
	// used to strip typescript types
	//
	"@babel/preset-typescript": {
		version: "7.25.7"
	},
	//
	// used to resolve "#"
	//
	"babel-plugin-module-resolver": {
		version: "5.0.2"
	}
}
