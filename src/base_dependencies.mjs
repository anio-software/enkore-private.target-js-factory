export default {
	"rollup": {
		version: "4.21.3",
		import_code: `import {rollup} from "rollup"\nexport default rollup`
	},
	//
	// needed to resolve npm dependencies
	//
	"@rollup/plugin-node-resolve": {
		version: "15.2.3"
	},
	//
	// needed to minify code
	//
	"@rollup/plugin-terser": {
		version: "0.4.4"
	},
	//
	// needed to process .d.ts files
	//
	"rollup-plugin-dts": {
		version: "6.1.1",
		import_code: `import {dts} from "rollup-plugin-dts"\nexport default dts`
	}
}
